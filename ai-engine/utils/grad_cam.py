import torch
import torch.nn.functional as F
import cv2
import numpy as np
import base64

def generate_gradcam_heatmap(model, input_tensor, original_image_pil):
    """
    Generates a Grad-CAM heatmap for the top predicted class (DenseNet121 Version).
    """
    
    # --- THE FIX: Target DenseNet Specific Layers ---
    # DenseNet121 stores features in 'features'. The last block is 'denseblock4'.
    target_layer = model.features.denseblock4
    
    gradients = []
    activations = []

    # Hook functions to capture the data during the pass
    def backward_hook(module, grad_input, grad_output):
        gradients.append(grad_output[0])

    def forward_hook(module, input, output):
        activations.append(output)

    # Register hooks
    hook_b = target_layer.register_full_backward_hook(backward_hook)
    hook_f = target_layer.register_forward_hook(forward_hook)

    # 1. Forward Pass (MUST allow gradients, so no torch.no_grad() here)
    model.zero_grad()
    output = model(input_tensor)
    
    # 2. Determine which class to explain
    # We explain the class with the HIGHEST probability
    score, index = torch.max(output, 1)
    
    # 3. Backward Pass (This calculates 'Importance')
    output[:, index].backward()

    # 4. Generate Heatmap
    # Pool the gradients (Global Average Pooling)
    pooled_gradients = torch.mean(gradients[0], dim=[0, 2, 3])
    
    # Get the activations from the forward pass
    activation = activations[0][0] 
    
    # Weight the activations by the gradients
    for i in range(activation.shape[0]):
        activation[i, :, :] *= pooled_gradients[i]
        
    # Average the channels to create a 2D heatmap
    heatmap = torch.mean(activation, dim=0).cpu().detach().numpy()
    
    # ReLU: We only care about features that have a POSITIVE influence on the class
    heatmap = np.maximum(heatmap, 0)
    
    # Normalize to 0-1 for display
    if np.max(heatmap) != 0:
        heatmap /= np.max(heatmap)

    # 5. Process for Display (Resize to original image size)
    orig_w, orig_h = original_image_pil.size
    heatmap = cv2.resize(heatmap, (orig_w, orig_h))
    
    # ColorMap (Blue = Low, Red = High Importance)
    heatmap_uint8 = np.uint8(255 * heatmap)
    heatmap_color = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    
    # Encode to Base64 for the API
    _, buffer = cv2.imencode('.jpg', heatmap_color)
    heatmap_b64 = base64.b64encode(buffer).decode('utf-8')

    # Cleanup: Remove hooks to save memory
    hook_b.remove()
    hook_f.remove()

    return "data:image/jpeg;base64," + heatmap_b64, index.item(), score.item()