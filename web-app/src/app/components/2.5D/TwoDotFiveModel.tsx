import React, { useRef, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import useEyeStore from '../../store/useEyeStore';

const Container = styled.div`
  width: 100%;
  height: 600px;
  position: relative;
  background-color: #f0f6fa;
  border-radius: 8px;
  overflow: hidden;
  user-select: none;
  touch-action: none;
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: auto;
`;

const ControlsOverlay = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  display: flex;
  gap: 10px;
  background: rgba(255, 255, 255, 0.8);
  padding: 8px;
  border-radius: 6px;
  z-index: 100;
`;

const ToolButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? '#3b82f6' : '#f1f5f9'};
  color: ${props => props.active ? 'white' : '#475569'};
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 5px;

  &:hover {
    background: ${props => props.active ? '#2563eb' : '#e2e8f0'};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 200;
`;

const ErrorOverlay = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f8f9fa;
  padding: 20px;
  text-align: center;
`;

// Add interactive feedback indicator
const DragFeedback = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 150;
  display: flex;
  justify-content: center;
  align-items: center;

  & > span {
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 14px;
  }
`;

interface ImageAsset {
  img: HTMLImageElement;
  loaded: boolean;
}

interface Tool {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
  dragging: boolean;
}

interface PrismTool extends Tool {
  value: number;
  axis: number;
}

interface EyePosition {
  x: number;
  y: number;
  pupilOffsetX: number;
  pupilOffsetY: number;
}

const TwoDotFiveModel = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Canvas references - following the example's 4-canvas structure
  const canvasRef1 = useRef<HTMLCanvasElement>(null); // Main canvas for eyes and face 
  const canvasRef2 = useRef<HTMLCanvasElement>(null); // Plain eyes (pupils) and light reflex
  const canvasRef3 = useRef<HTMLCanvasElement>(null); // Tools layer (occluder, target)
  const canvasRef4 = useRef<HTMLCanvasElement>(null); // UI elements layer

  const [canvasSize, setCanvasSize] = useState({ width: 900, height: 600 });
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [assets, setAssets] = useState<Record<string, ImageAsset>>({});
  const [hasError, setHasError] = useState(false);
  
  // Eye positions - using exact values from example code (see calcEyeCenter function)
  const [eyeCenterOD] = useState({ x: 300, y: 215 });
  const [eyeCenterOS] = useState({ x: 600, y: 215 });
  
  // Tools state
  const [activeTool, setActiveTool] = useState<'occluder' | 'target' | 'prism' | null>(null);
  const [occluder, setOccluder] = useState<Tool>({ 
    x: eyeCenterOD.x, y: eyeCenterOD.y, width: 200, height: 200, active: false, dragging: false 
  });
  const [target, setTarget] = useState<Tool>({ 
    x: 450, y: 80, width: 130, height: 570, active: false, dragging: false 
  });
  const [prism, setPrism] = useState<PrismTool>({
    x: 450, y: 300, width: 150, height: 150, active: false, dragging: false, value: 0, axis: 0
  });

  // Eye positions with deviations
  const [eyePositions, setEyePositions] = useState<{
    left: EyePosition;
    right: EyePosition;
  }>({
    left: {
      x: eyeCenterOD.x,
      y: eyeCenterOD.y,
      pupilOffsetX: 0,
      pupilOffsetY: 0
    },
    right: {
      x: eyeCenterOS.x,
      y: eyeCenterOS.y,
      pupilOffsetX: 0,
      pupilOffsetY: 0
    }
  });

  // Drag state
  const dragStartRef = useRef({ x: 0, y: 0 });
  
  // Get state from eye store
  const {
    pupilSize,
    irisColor,
    eyeSize,
    eyePosition,
    irisPosition,
    pupilPosition,
    esotropia,
    exotropia,
    hypertropia,
    hypotropia,
    esophoria,
    exophoria,
    hyperphoria,
    hypophoria,
    occluderPosition,
    setOccluderPosition,
    activeTool: storeActiveTool,
    setActiveTool: setStoreActiveTool,
    setIrisPosition,
    prismValue,
    setPrismValue,
    prismAxis,
    setPrismAxis
  } = useEyeStore();

  // Animation loop reference
  const animationFrameRef = useRef<number | null>(null);
  
  // Add visual feedback state
  const [feedback, setFeedback] = useState<string | null>(null);
  
  // Sync tool state with store
  useEffect(() => {
    if (storeActiveTool === 'occluder') {
      setActiveTool('occluder');
      setOccluder(prev => ({ ...prev, active: true }));
      setTarget(prev => ({ ...prev, active: false }));
      setPrism(prev => ({ ...prev, active: false }));
    } else if (storeActiveTool === 'target') {
      setActiveTool('target');
      setTarget(prev => ({ ...prev, active: true }));
      setOccluder(prev => ({ ...prev, active: false }));
      setPrism(prev => ({ ...prev, active: false }));
    } else if (storeActiveTool === 'prism') {
      setActiveTool('prism');
      setPrism(prev => ({ ...prev, active: true }));
      setOccluder(prev => ({ ...prev, active: false }));
      setTarget(prev => ({ ...prev, active: false }));
    } else {
      setActiveTool(null);
      setOccluder(prev => ({ ...prev, active: false }));
      setTarget(prev => ({ ...prev, active: false }));
      setPrism(prev => ({ ...prev, active: false }));
    }
  }, [storeActiveTool]);

  // Sync occluder position with store
  useEffect(() => {
    if (occluderPosition === 'left') {
      setOccluder(prev => ({ 
        ...prev, 
        x: eyeCenterOD.x, 
        y: eyeCenterOD.y, 
        active: true 
      }));
    } else if (occluderPosition === 'right') {
      setOccluder(prev => ({ 
        ...prev, 
        x: eyeCenterOS.x, 
        y: eyeCenterOS.y, 
        active: true 
      }));
    } else {
      setOccluder(prev => ({ ...prev, active: false }));
    }
  }, [occluderPosition, eyeCenterOD, eyeCenterOS]);

  // Sync prism values with store
  useEffect(() => {
    setPrism(prev => ({ ...prev, value: prismValue, axis: prismAxis }));
  }, [prismValue, prismAxis]);

  // Load images once on component mount
  useEffect(() => {
    const imageList = [
      { name: 'face', src: '/images/2.5D-new/n_face_sm.png' },
      { name: 'eye', src: '/images/2.5D-new/n_eye.png' },
      { name: 'plainEye', src: '/images/2.5D-new/n_eye_plain.png' },
      { name: 'occluder', src: '/images/2.5D-new/n_cover.png' },
      { name: 'target', src: '/images/2.5D-new/target_stick.png' },
      { name: 'prism', src: '/images/2.5D-new/prism.png' },
      { name: 'lightReflex', src: '/images/2.5D-new/lightReflex.png' },
      { name: 'kidEye', src: '/images/2.5D-new/n_eye_kid.png' },
      { name: 'girlEye', src: '/images/2.5D-new/n_eye_girl.png' },
      { name: 'faceGirl', src: '/images/2.5D-new/n_face_sm_girl.png' },
      { name: 'faceKid', src: '/images/2.5D-new/n_face_sm_kid.png' },
      { name: 'facePlain', src: '/images/2.5D-new/n_face_sm_plain.png' },
    ];

    const imageAssets: Record<string, ImageAsset> = {};
    let loadedCount = 0;

    const onImageLoad = () => {
      loadedCount++;
      setLoadingProgress(Math.floor((loadedCount / imageList.length) * 100));
      
      if (loadedCount === imageList.length) {
        setImagesLoaded(true);
        setAssets(imageAssets);
      }
    };

    const onImageError = (imageName: string) => {
      console.error(`Failed to load image: ${imageName}`);
      
      // Only set error state for critical images
      if (['face', 'eye', 'occluder', 'target'].includes(imageName)) {
        setHasError(true);
      } else {
        // For non-critical images like prism, just increment the counter
        // so we don't block the whole component from loading
        loadedCount++;
        setLoadingProgress(Math.floor((loadedCount / imageList.length) * 100));
        
        // If this was the last image, set loaded state
        if (loadedCount === imageList.length) {
          setImagesLoaded(true);
          setAssets(imageAssets);
        }
      }
    };

    // Preload all images
    imageList.forEach(({ name, src }) => {
      const img = new Image();
      img.onload = onImageLoad;
      img.onerror = () => onImageError(name);
      img.src = src;
      imageAssets[name] = { img, loaded: false };
    });

    // Initialize canvas size based on container size
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setCanvasSize({ 
          width: Math.max(width, 900), 
          height: Math.max(height, 600) 
        });
      }
    };

    // Set initial size and add resize listener
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Handle mouse/touch interactions
  useEffect(() => {
    // Get all canvas references to ensure we capture events on all layers
    const canvasRefs = [canvasRef1, canvasRef2, canvasRef3, canvasRef4];
    const canvases = canvasRefs.map(ref => ref.current).filter(Boolean) as HTMLCanvasElement[];
    
    if (canvases.length === 0) return;

    // Create a root event handler for the container to capture all mouse events
    const container = containerRef.current;
    if (!container) return;
    
    const handleMouseDown = (e: MouseEvent) => {
      // Get container bounds for coordinate conversion
      const rect = container.getBoundingClientRect();
      
      // Use the raw mouse position relative to the container
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate face image dimensions to maintain aspect ratio (same as in drawFrame)
      if (assets.face && assets.face.img) {
        const faceImg = assets.face.img;
        const imgAspectRatio = faceImg.width / faceImg.height;
        const canvasAspectRatio = canvasSize.width / canvasSize.height;
        
        // Calculate the scale factors and offsets
        let renderWidth, renderHeight, offsetX = 0, offsetY = 0;
        
        if (imgAspectRatio > canvasAspectRatio) {
          renderWidth = canvasSize.width;
          renderHeight = canvasSize.width / imgAspectRatio;
          offsetY = (canvasSize.height - renderHeight) / 2;
        } else {
          renderHeight = canvasSize.height;
          renderWidth = canvasSize.height * imgAspectRatio;
          offsetX = (canvasSize.width - renderWidth) / 2;
        }

        // Calculate the scale between canvas coordinates and element coordinates
        const scaleX = canvasSize.width / rect.width;
        const scaleY = canvasSize.height / rect.height;
        
        // Convert mouse coordinates to canvas coordinates
        const canvasMouseX = mouseX * scaleX;
        const canvasMouseY = mouseY * scaleY;

        const eyeAdjustScaleX = renderWidth / 900;
        const eyeAdjustScaleY = renderHeight / 600;
        
        // Calculate occluder and target positions in canvas coordinates
        const adjustedOccluderX = occluder.x * eyeAdjustScaleX + offsetX;
        const adjustedOccluderY = occluder.y * eyeAdjustScaleY + offsetY;
        const adjustedOccluderWidth = occluder.width * eyeAdjustScaleX;
        const adjustedOccluderHeight = occluder.height * eyeAdjustScaleY;

        const adjustedTargetX = target.x * eyeAdjustScaleX + offsetX;
        const adjustedTargetY = target.y * eyeAdjustScaleY + offsetY;
        const adjustedTargetWidth = target.width * eyeAdjustScaleX;
        const adjustedTargetHeight = target.height * eyeAdjustScaleY;

        const adjustedPrismX = prism.x * eyeAdjustScaleX + offsetX;
        const adjustedPrismY = prism.y * eyeAdjustScaleY + offsetY;
        const adjustedPrismWidth = prism.width * eyeAdjustScaleX;
        const adjustedPrismHeight = prism.height * eyeAdjustScaleY;

        // Increase hit area size for easier selection
        const hitAreaExpansion = 20;

        // Check if occluder is clicked (using adjusted positions)
        if (
          activeTool === 'occluder' &&
          canvasMouseX >= adjustedOccluderX - (adjustedOccluderWidth / 2 + hitAreaExpansion) &&
          canvasMouseX <= adjustedOccluderX + (adjustedOccluderWidth / 2 + hitAreaExpansion) &&
          canvasMouseY >= adjustedOccluderY - (adjustedOccluderHeight / 2 + hitAreaExpansion) &&
          canvasMouseY <= adjustedOccluderY + (adjustedOccluderHeight / 2 + hitAreaExpansion)
        ) {
          setOccluder(prev => ({ ...prev, dragging: true }));
          dragStartRef.current = { 
            x: canvasMouseX - adjustedOccluderX, 
            y: canvasMouseY - adjustedOccluderY 
          };
          setFeedback("Dragging Occluder");
          e.preventDefault(); // Prevent default to avoid text selection
        }
        
        // Check if target is clicked (using adjusted positions)
        if (
          activeTool === 'target' &&
          canvasMouseX >= adjustedTargetX - (adjustedTargetWidth / 2 + hitAreaExpansion) &&
          canvasMouseX <= adjustedTargetX + (adjustedTargetWidth / 2 + hitAreaExpansion) &&
          canvasMouseY >= adjustedTargetY - hitAreaExpansion &&
          canvasMouseY <= adjustedTargetY + adjustedTargetHeight + hitAreaExpansion
        ) {
          setTarget(prev => ({ ...prev, dragging: true }));
          dragStartRef.current = { 
            x: canvasMouseX - adjustedTargetX, 
            y: canvasMouseY - adjustedTargetY 
          };
          setFeedback("Dragging Target");
          e.preventDefault(); // Prevent default to avoid text selection
        }

        // Check if prism is clicked
        if (
          activeTool === 'prism' &&
          canvasMouseX >= adjustedPrismX - (adjustedPrismWidth / 2 + hitAreaExpansion) &&
          canvasMouseX <= adjustedPrismX + (adjustedPrismWidth / 2 + hitAreaExpansion) &&
          canvasMouseY >= adjustedPrismY - (adjustedPrismHeight / 2 + hitAreaExpansion) &&
          canvasMouseY <= adjustedPrismY + (adjustedPrismHeight / 2 + hitAreaExpansion)
        ) {
          setPrism(prev => ({ ...prev, dragging: true }));
          dragStartRef.current = { 
            x: canvasMouseX - adjustedPrismX, 
            y: canvasMouseY - adjustedPrismY 
          };
          setFeedback("Dragging Prism");
          e.preventDefault(); // Prevent default to avoid text selection
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Only process if we're actually dragging something
      if (!occluder.dragging && !target.dragging && !prism.dragging) return;
      
      // Get container bounds for coordinate conversion
      const rect = container.getBoundingClientRect();
      
      // Use the raw mouse position relative to the container
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Calculate the scale between canvas coordinates and element coordinates
      const scaleX = canvasSize.width / rect.width;
      const scaleY = canvasSize.height / rect.height;
      
      // Convert mouse coordinates to canvas coordinates
      const canvasMouseX = mouseX * scaleX;
      const canvasMouseY = mouseY * scaleY;

      // Calculate image scaling factors
      if (assets.face && assets.face.img) {
        const faceImg = assets.face.img;
        const imgAspectRatio = faceImg.width / faceImg.height;
        const canvasAspectRatio = canvasSize.width / canvasSize.height;
        
        let renderWidth, renderHeight, offsetX = 0, offsetY = 0;
        
        if (imgAspectRatio > canvasAspectRatio) {
          renderWidth = canvasSize.width;
          renderHeight = canvasSize.width / imgAspectRatio;
          offsetY = (canvasSize.height - renderHeight) / 2;
        } else {
          renderHeight = canvasSize.height;
          renderWidth = canvasSize.height * imgAspectRatio;
          offsetX = (canvasSize.width - renderWidth) / 2;
        }

        const eyeAdjustScaleX = renderWidth / 900;
        const eyeAdjustScaleY = renderHeight / 600;

        // Calculate eye positions based on facial anatomy proportions
        const eyeYPosition = offsetY + (renderHeight * 0.38);
        const leftEyeXPosition = offsetX + (renderWidth * 0.33);
        const rightEyeXPosition = offsetX + (renderWidth * 0.67);
        
        // Calculate adjusted eye positions
        const adjustedEyeCenterOD = {
          x: leftEyeXPosition,
          y: eyeYPosition + (75 * eyeAdjustScaleY)
        };
        
        const adjustedEyeCenterOS = {
          x: rightEyeXPosition,
          y: eyeYPosition + (75 * eyeAdjustScaleY)
        };

        // Move occluder if dragging
        if (occluder.dragging) {
          // First convert mouse position back to original coordinate space
          const originalX = (canvasMouseX - offsetX) / eyeAdjustScaleX;
          const originalY = (canvasMouseY - offsetY) / eyeAdjustScaleY;
          const newX = originalX - dragStartRef.current.x / eyeAdjustScaleX;
          const newY = originalY - dragStartRef.current.y / eyeAdjustScaleY;
          
          setOccluder(prev => ({ ...prev, x: newX, y: newY }));
          
          // Determine which eye is covered (using adjusted positions)
          const leftDist = Math.hypot(
            canvasMouseX - adjustedEyeCenterOD.x, 
            canvasMouseY - adjustedEyeCenterOD.y
          );
          const rightDist = Math.hypot(
            canvasMouseX - adjustedEyeCenterOS.x, 
            canvasMouseY - adjustedEyeCenterOS.y
          );
          
          const proximityThreshold = 120 * Math.min(eyeAdjustScaleX, eyeAdjustScaleY);
          
          if (leftDist < rightDist && leftDist < proximityThreshold) {
            setOccluderPosition('left');
            setFeedback("Occluding Left Eye");
          } else if (rightDist < proximityThreshold) {
            setOccluderPosition('right');
            setFeedback("Occluding Right Eye");
          } else {
            setOccluderPosition(null);
            setFeedback("Dragging Occluder");
          }
          
          e.preventDefault();
        }
        
        // Move target if dragging
        if (target.dragging) {
          // First convert mouse position back to original coordinate space
          const originalX = (canvasMouseX - offsetX) / eyeAdjustScaleX;
          const originalY = (canvasMouseY - offsetY) / eyeAdjustScaleY;
          const newX = originalX - dragStartRef.current.x / eyeAdjustScaleX;
          const newY = originalY - dragStartRef.current.y / eyeAdjustScaleY;
          
          setTarget(prev => ({ ...prev, x: newX, y: newY }));

          // Update iris positions to look at target
          const centerX = canvasSize.width / 2;
          const centerY = canvasSize.height / 2;
          
          // Calculate normalized direction from center to target (-1 to 1 range)
          const dirX = (canvasMouseX - centerX) / (centerX);
          const dirY = (canvasMouseY - centerY) / (centerY);
          
          // Store current deviation-based positions before applying target gaze
          if (!target.active) {
            // Only set target active on first drag movement
            setTarget(prev => ({ ...prev, active: true }));
          }
          
          // Apply to iris positions with a scaled factor (overriding any deviation settings temporarily)
          // Use a direct value rather than incremental update
          setIrisPosition('left', { x: dirX * 0.5, y: dirY * 0.5 });
          setIrisPosition('right', { x: dirX * 0.5, y: dirY * 0.5 });
          
          e.preventDefault();
        }

        // Move prism if dragging
        if (prism.dragging) {
          // First convert mouse position back to original coordinate space
          const originalX = (canvasMouseX - offsetX) / eyeAdjustScaleX;
          const originalY = (canvasMouseY - offsetY) / eyeAdjustScaleY;
          const newX = originalX - dragStartRef.current.x / eyeAdjustScaleX;
          const newY = originalY - dragStartRef.current.y / eyeAdjustScaleY;
          
          setPrism(prev => ({ ...prev, x: newX, y: newY }));

          // Get the center of the canvas
          const centerX = canvasSize.width / 2;
          const centerY = canvasSize.height / 2;
          
          // Calculate distance from center (affects prism value)
          const dx = canvasMouseX - centerX;
          const dy = canvasMouseY - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Convert distance to prism value (1-20 range)
          // Normalize distance to max container dimension
          const maxDimension = Math.max(canvasSize.width, canvasSize.height) / 2;
          const normalizedDistance = Math.min(distance / maxDimension, 1);
          const newPrismValue = Math.round(normalizedDistance * 20);
          
          // Calculate angle (affects prism axis)
          // atan2 returns angle in radians, convert to degrees
          let angle = Math.atan2(dy, dx) * (180 / Math.PI);
          // Convert to 0-360 range
          angle = (angle + 360) % 360;
          // Round to nearest 15 degrees
          const roundedAngle = Math.round(angle / 15) * 15;
          
          // Update prism values in the store
          setPrismValue(newPrismValue);
          setPrismAxis(roundedAngle);

          // Store current deviation-based positions before applying prism effect
          if (!prism.active) {
            // Only set prism active on first drag movement
            setPrism(prev => ({ ...prev, active: true }));
          }
          
          // Apply prism effect to iris positions (overriding any deviation settings temporarily)
          const angleRadians = (roundedAngle * Math.PI) / 180;
          const displacementFactor = newPrismValue / 40; // Scale factor
          const displacementX = Math.cos(angleRadians) * displacementFactor;
          const displacementY = Math.sin(angleRadians) * displacementFactor;
          
          // Use a direct value rather than incremental update
          setIrisPosition('left', { x: displacementX, y: displacementY });
          setIrisPosition('right', { x: displacementX, y: displacementY });
          
          e.preventDefault();
        }
      }
    };

    const handleMouseUp = () => {
      // Check if we were previously dragging a tool
      const wasDraggingTool = occluder.dragging || target.dragging || prism.dragging;
      
      // Reset dragging states
      setOccluder(prev => ({ ...prev, dragging: false }));
      setTarget(prev => ({ ...prev, dragging: false }));
      setPrism(prev => ({ ...prev, dragging: false }));
      
      // Clear drag feedback
      setFeedback(null);
      
      // If we were dragging target or prism, restore eye deviations
      if ((target.dragging || prism.dragging) && wasDraggingTool) {
        // Let the deviation effect hook handle resetting positions
        // This will happen on next render cycle
        
        // Calculate deviation effects for each eye
        const horizontalScale = 2;
        const verticalScale = 2;
        
        // Calculate tropias for left eye
        const leftXOffset = (esotropia * horizontalScale) - (exotropia * horizontalScale);
        const leftYOffset = -(hypertropia * verticalScale) + (hypotropia * verticalScale);
        
        // Calculate tropias for right eye
        const rightXOffset = -(esotropia * horizontalScale) + (exotropia * horizontalScale);
        const rightYOffset = -(hypertropia * verticalScale) + (hypotropia * verticalScale);
        
        // Apply phorias if needed
        let finalLeftX = leftXOffset;
        let finalLeftY = leftYOffset;
        let finalRightX = rightXOffset;
        let finalRightY = rightYOffset;
        
        if (occluderPosition === 'left') {
          const leftPhoriaX = (esophoria * horizontalScale) - (exophoria * horizontalScale);
          const leftPhoriaY = -(hyperphoria * verticalScale) + (hypophoria * verticalScale);
          finalLeftX += leftPhoriaX;
          finalLeftY += leftPhoriaY;
        }
        
        if (occluderPosition === 'right') {
          const rightPhoriaX = -(esophoria * horizontalScale) + (exophoria * horizontalScale);
          const rightPhoriaY = -(hyperphoria * verticalScale) + (hypophoria * verticalScale);
          finalRightX += rightPhoriaX;
          finalRightY += rightPhoriaY;
        }
        
        // For target, we want to maintain the target position
        // For prism, we need to maintain the prism effect
        if (activeTool === 'target' || activeTool === 'prism') {
          // Let the active tool maintain control
        } else {
          // Apply to iris positions
          setIrisPosition('left', { x: finalLeftX/10, y: finalLeftY/10 });
          setIrisPosition('right', { x: finalRightX/10, y: finalRightY/10 });
        }
      }
    };

    // Add mouse event listeners to the container instead of individual canvases
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseUp);
    
    // Add touch event handlers for mobile devices
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      handleMouseDown(mouseEvent);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      handleMouseMove(mouseEvent);
      
      // Prevent scrolling when dragging
      if (occluder.dragging || target.dragging || prism.dragging) {
        e.preventDefault();
      }
    };
    
    const handleTouchEnd = () => {
      handleMouseUp();
    };
    
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      // Clean up all event listeners
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseUp);
      
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    activeTool, 
    occluder, 
    target, 
    prism,
    eyeCenterOD, 
    eyeCenterOS, 
    setOccluderPosition, 
    assets.face, 
    canvasSize,
    prismValue,
    prismAxis,
    setPrismValue,
    setPrismAxis,
    setIrisPosition,
    esotropia,
    exotropia,
    hypertropia,
    hypotropia,
    esophoria,
    exophoria,
    hyperphoria,
    hypophoria,
    occluderPosition
  ]);

  // Calculate eye positions based on deviations and store values
  useEffect(() => {
    // Scale factor to convert prismatic diopters to pixels
    const horizontalScale = 2;
    const verticalScale = 2;

    // Create base eye positions
    const newEyePositions = {
      left: {
        x: eyeCenterOD.x,
        y: eyeCenterOD.y,
        pupilOffsetX: 0,
        pupilOffsetY: 0
      },
      right: {
        x: eyeCenterOS.x,
        y: eyeCenterOS.y,
        pupilOffsetX: 0,
        pupilOffsetY: 0
      }
    };

    // Skip applying deviations if active tools should override them
    const isTargetOrPrism = 
      activeTool === 'target' || 
      activeTool === 'prism';

    if (isTargetOrPrism) {
      setEyePositions(newEyePositions);
      return;
    }

    // Calculate total deviation offsets for both eyes
    let leftXOffset = 0;
    let leftYOffset = 0;
    let rightXOffset = 0;
    let rightYOffset = 0;

    // Apply manifest deviations (tropias)
    leftXOffset += (esotropia * horizontalScale) - (exotropia * horizontalScale);
    leftYOffset += -(hypertropia * verticalScale) + (hypotropia * verticalScale);
    rightXOffset += -(esotropia * horizontalScale) + (exotropia * horizontalScale);
    rightYOffset += -(hypertropia * verticalScale) + (hypotropia * verticalScale);

    // Apply latent deviations (phorias) when eye is covered
    if (occluderPosition === 'left') {
      const leftPhoriaX = (esophoria * horizontalScale) - (exophoria * horizontalScale);
      const leftPhoriaY = -(hyperphoria * verticalScale) + (hypophoria * verticalScale);
      leftXOffset += leftPhoriaX;
      leftYOffset += leftPhoriaY;
    }

    if (occluderPosition === 'right') {
      const rightPhoriaX = -(esophoria * horizontalScale) + (exophoria * horizontalScale);
      const rightPhoriaY = -(hyperphoria * verticalScale) + (hypophoria * verticalScale);
      rightXOffset += rightPhoriaX;
      rightYOffset += rightPhoriaY;
    }

    // Convert to normalized values for the iris position
    const normalizedLeftX = leftXOffset / 10;
    const normalizedLeftY = leftYOffset / 10;
    const normalizedRightX = rightXOffset / 10;
    const normalizedRightY = rightYOffset / 10;

    // Only update if there are significant deviations and we're not using tools
    // This avoids creating an infinite update loop
    const hasSignificantDeviations = 
      Math.abs(normalizedLeftX) > 0.1 || 
      Math.abs(normalizedLeftY) > 0.1 || 
      Math.abs(normalizedRightX) > 0.1 || 
      Math.abs(normalizedRightY) > 0.1;
      
    if (hasSignificantDeviations && !isTargetOrPrism) {
      // Apply deviations directly without referencing irisPosition
      // This prevents the infinite loop
      setIrisPosition('left', { 
        x: normalizedLeftX, 
        y: normalizedLeftY 
      });
      
      setIrisPosition('right', { 
        x: normalizedRightX, 
        y: normalizedRightY 
      });
    }

    setEyePositions(newEyePositions);
  }, [
    eyeCenterOD,
    eyeCenterOS,
    esotropia,
    exotropia,
    hypertropia,
    hypotropia,
    esophoria,
    exophoria,
    hyperphoria,
    hypophoria,
    occluderPosition,
    setIrisPosition,
    activeTool
    // Remove irisPosition from dependencies to break the infinite loop
  ]);

  // Setup and run the animation loop
  useEffect(() => {
    if (!imagesLoaded || 
        !canvasRef1.current || 
        !canvasRef2.current || 
        !canvasRef3.current || 
        !canvasRef4.current) {
      return;
    }

    const ctx1 = canvasRef1.current.getContext('2d', { alpha: true });
    const ctx2 = canvasRef2.current.getContext('2d', { alpha: true });
    const ctx3 = canvasRef3.current.getContext('2d', { alpha: true });
    const ctx4 = canvasRef4.current.getContext('2d', { alpha: true });

    if (!ctx1 || !ctx2 || !ctx3 || !ctx4) {
      console.error('Unable to get canvas context');
      setHasError(true);
      return;
    }

    // Set canvas sizes
    canvasRef1.current.width = canvasSize.width;
    canvasRef1.current.height = canvasSize.height;
    canvasRef2.current.width = canvasSize.width;
    canvasRef2.current.height = canvasSize.height;
    canvasRef3.current.width = canvasSize.width;
    canvasRef3.current.height = canvasSize.height;
    canvasRef4.current.width = canvasSize.width;
    canvasRef4.current.height = canvasSize.height;

    // Enable image smoothing for better quality
    [ctx1, ctx2, ctx3, ctx4].forEach(ctx => {
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      }
    });

    // Animation loop - following the drawShapes function from the example
    const drawFrame = () => {
      // Clear all canvases
      ctx1.clearRect(0, 0, canvasSize.width, canvasSize.height);
      ctx2.clearRect(0, 0, canvasSize.width, canvasSize.height);
      ctx3.clearRect(0, 0, canvasSize.width, canvasSize.height);
      ctx4.clearRect(0, 0, canvasSize.width, canvasSize.height);

      try {
        // Calculate face image dimensions to maintain aspect ratio
        if (assets.face && assets.face.img) {
          const faceImg = assets.face.img;
          const imgAspectRatio = faceImg.width / faceImg.height;
          const canvasAspectRatio = canvasSize.width / canvasSize.height;
          
          let renderWidth, renderHeight, offsetX = 0, offsetY = 0;
          
          if (imgAspectRatio > canvasAspectRatio) {
            // Image is wider than canvas (relative to height)
            renderWidth = canvasSize.width;
            renderHeight = canvasSize.width / imgAspectRatio;
            offsetY = (canvasSize.height - renderHeight) / 2;
          } else {
            // Image is taller than canvas (relative to width)
            renderHeight = canvasSize.height;
            renderWidth = canvasSize.height * imgAspectRatio;
            offsetX = (canvasSize.width - renderWidth) / 2;
          }
          
          // Draw the face with preserved aspect ratio (use this as the base layer)
          ctx1.drawImage(
            faceImg,
            offsetX,
            offsetY,
            renderWidth,
            renderHeight
          );

          // Calculate eye positions based on facial anatomy proportions
          // These proportions are based on the specific face image being used
          // For this face model, the eyes are approximately 23% from the top of the head
          // and horizontally positioned at 33% and 67% of the face width
          const eyeYPosition = offsetY + (renderHeight * 0.38);
          const leftEyeXPosition = offsetX + (renderWidth * 0.33);
          const rightEyeXPosition = offsetX + (renderWidth * 0.67);
          
          // Adjust eye center positions based on the calculated positions
          const eyeAdjustScaleX = renderWidth / 900;
          const eyeAdjustScaleY = renderHeight / 600;
          
          // Update the eye centers to match the face's anatomical eye positions
          const adjustedEyeCenterOD = {
            x: leftEyeXPosition,
            y: eyeYPosition + (75 * eyeAdjustScaleY)
          };
          
          const adjustedEyeCenterOS = {
            x: rightEyeXPosition,
            y: eyeYPosition + (75 * eyeAdjustScaleY)
          };
          
          // 3. Draw custom iris and pupil on canvas 2
          const irisRadius = 28 * eyeAdjustScaleX;
          
          // Improved pupil radius calculation that better responds to pupil size control
          // Increase the base radius to make the pupil more visible
          // and adjust the scaling factor to respond better to pupil size changes
          const pupilBaseRadius = 10 * eyeAdjustScaleX;
          // Scale factor increased from 1/5 to 1/3 for more noticeable size changes
          const pupilRadius = pupilBaseRadius * (pupilSize.left / 3);
          
          // Left eye iris/pupil
          if (occluderPosition !== 'left') {
            // Create a clipping path for the left eye socket
            ctx2.save();
            ctx2.beginPath();
            // Create an elliptical clip path for the eye
            ctx2.ellipse(
              adjustedEyeCenterOD.x,
              adjustedEyeCenterOD.y,
              80 * eyeAdjustScaleX,  // Eye socket width
              50 * eyeAdjustScaleY,  // Eye socket height
              0, 0, Math.PI * 2
            );
            ctx2.clip();
            
            // Calculate iris position with stronger weighting for joystick movement
            // Add deviation effects from stored deviation values rather than direct state
            const irisOffsetX = (eyePosition.left.x * 40) * eyeAdjustScaleX;
            const irisOffsetY = (eyePosition.left.y * 40) * eyeAdjustScaleY;

            // Add the deviation component separately - these are stored in irisPosition
            const deviationOffsetX = irisPosition.left.x * 25 * eyeAdjustScaleX;
            const deviationOffsetY = irisPosition.left.y * 25 * eyeAdjustScaleY;

            // Draw left iris directly without the sclera (white part)
            ctx2.beginPath();
            ctx2.fillStyle = irisColor.left;
            ctx2.arc(
              adjustedEyeCenterOD.x + irisOffsetX + deviationOffsetX,
              adjustedEyeCenterOD.y + irisOffsetY + deviationOffsetY,
              irisRadius * eyeSize.left,
              0, Math.PI * 2
            );
            ctx2.fill();
            
            // Calculate pupil position relative to iris
            // Add pupil offset relative to iris position
            const pupilOffsetX = ((pupilPosition.left.x - irisPosition.left.x) * 15) * eyeAdjustScaleX;
            const pupilOffsetY = ((pupilPosition.left.y - irisPosition.left.y) * 15) * eyeAdjustScaleY;
            
            // Draw left pupil
            ctx2.beginPath();
            ctx2.fillStyle = '#000000';
            ctx2.arc(
              adjustedEyeCenterOD.x + irisOffsetX + deviationOffsetX + pupilOffsetX,
              adjustedEyeCenterOD.y + irisOffsetY + deviationOffsetY + pupilOffsetY,
              pupilRadius,  // Use the calculated pupil radius directly
              0, Math.PI * 2
            );
            ctx2.fill();
            
            // Add light reflex for left eye
            ctx2.beginPath();
            ctx2.fillStyle = '#ffffff';
            ctx2.arc(
              adjustedEyeCenterOD.x + irisOffsetX + deviationOffsetX + pupilOffsetX + 2 * eyeAdjustScaleX,
              adjustedEyeCenterOD.y + irisOffsetY + deviationOffsetY + pupilOffsetY - 2 * eyeAdjustScaleY,
              3 * eyeAdjustScaleX,
              0, Math.PI * 2
            );
            ctx2.fill();
            
            // Restore the context to remove clipping
            ctx2.restore();
          }
          
          // Right eye iris/pupil
          if (occluderPosition !== 'right') {
            // Create a clipping path for the right eye socket
            ctx2.save();
            ctx2.beginPath();
            // Create an elliptical clip path for the eye
            ctx2.ellipse(
              adjustedEyeCenterOS.x,
              adjustedEyeCenterOS.y,
              80 * eyeAdjustScaleX,  // Eye socket width
              50 * eyeAdjustScaleY,  // Eye socket height
              0, 0, Math.PI * 2
            );
            ctx2.clip();
            
            // Calculate iris position with stronger weighting for joystick movement
            const irisOffsetX = (eyePosition.right.x * 40) * eyeAdjustScaleX;
            const irisOffsetY = (eyePosition.right.y * 40) * eyeAdjustScaleY;

            // Add the deviation component separately
            const deviationOffsetX = irisPosition.right.x * 25 * eyeAdjustScaleX;
            const deviationOffsetY = irisPosition.right.y * 25 * eyeAdjustScaleY;

            // Draw right iris directly without the sclera (white part)
            ctx2.beginPath();
            ctx2.fillStyle = irisColor.right;
            ctx2.arc(
              adjustedEyeCenterOS.x + irisOffsetX + deviationOffsetX,
              adjustedEyeCenterOS.y + irisOffsetY + deviationOffsetY,
              irisRadius * eyeSize.right,
              0, Math.PI * 2
            );
            ctx2.fill();
            
            // Calculate pupil position relative to iris
            // Add pupil offset relative to iris position
            const pupilOffsetX = ((pupilPosition.right.x - irisPosition.right.x) * 15) * eyeAdjustScaleX;
            const pupilOffsetY = ((pupilPosition.right.y - irisPosition.right.y) * 15) * eyeAdjustScaleY;
            
            // Draw right pupil - adjust for right eye pupil size
            const rightPupilRadius = pupilBaseRadius * (pupilSize.right / 3);
            
            ctx2.beginPath();
            ctx2.fillStyle = '#000000';
            ctx2.arc(
              adjustedEyeCenterOS.x + irisOffsetX + deviationOffsetX + pupilOffsetX,
              adjustedEyeCenterOS.y + irisOffsetY + deviationOffsetY + pupilOffsetY,
              rightPupilRadius,  // Use the calculated pupil radius for right eye
              0, Math.PI * 2
            );
            ctx2.fill();
            
            // Add light reflex for right eye
            ctx2.beginPath();
            ctx2.fillStyle = '#ffffff';
            ctx2.arc(
              adjustedEyeCenterOS.x + irisOffsetX + deviationOffsetX + pupilOffsetX + 2 * eyeAdjustScaleX,
              adjustedEyeCenterOS.y + irisOffsetY + deviationOffsetY + pupilOffsetY - 2 * eyeAdjustScaleY,
              3 * eyeAdjustScaleX,
              0, Math.PI * 2
            );
            ctx2.fill();
            
            // Restore the context to remove clipping
            ctx2.restore();
          }
          
          // 5. Draw occluder on layer 3 (with adjusted position)
          if (occluder.active && assets.occluder && assets.occluder.img) {
            // Adjust occluder position and size based on image scale
            const adjustedOccluderX = occluder.x * eyeAdjustScaleX + offsetX;
            const adjustedOccluderY = occluder.y * eyeAdjustScaleY + offsetY;
            const adjustedOccluderWidth = occluder.width * eyeAdjustScaleX;
            const adjustedOccluderHeight = occluder.height * eyeAdjustScaleY;
            
            ctx3.drawImage(
              assets.occluder.img,
              adjustedOccluderX - adjustedOccluderWidth / 2,
              adjustedOccluderY - adjustedOccluderHeight / 2,
              adjustedOccluderWidth,
              adjustedOccluderHeight
            );
          }

          // 6. Draw target on layer 3 (with adjusted position)
          if (target.active && assets.target && assets.target.img) {
            // Adjust target position and size based on image scale
            const adjustedTargetX = target.x * eyeAdjustScaleX + offsetX;
            const adjustedTargetY = target.y * eyeAdjustScaleY + offsetY;
            const adjustedTargetWidth = target.width * eyeAdjustScaleX;
            const adjustedTargetHeight = target.height * eyeAdjustScaleY;
            
            ctx3.drawImage(
              assets.target.img,
              adjustedTargetX - adjustedTargetWidth / 2,
              adjustedTargetY,
              adjustedTargetWidth,
              adjustedTargetHeight
            );
          }

          // Draw prism on layer 3 (tools layer)
          if (prism.active) {
            // Adjust prism position and size based on image scale
            const adjustedPrismX = prism.x * eyeAdjustScaleX + offsetX;
            const adjustedPrismY = prism.y * eyeAdjustScaleY + offsetY;
            const adjustedPrismWidth = prism.width * eyeAdjustScaleX;
            const adjustedPrismHeight = prism.height * eyeAdjustScaleY;
            
            // Save context to restore after rotation
            ctx3.save();
            
            // Translate to the center of where the prism will be drawn
            ctx3.translate(adjustedPrismX, adjustedPrismY);
            
            // Rotate the context by the prism axis angle
            ctx3.rotate((prism.axis * Math.PI) / 180);
            
            if (assets.prism && assets.prism.img) {
              // Draw the prism image centered at the origin (0,0) of the rotated context
              ctx3.drawImage(
                assets.prism.img,
                -adjustedPrismWidth / 2,  // Center the image horizontally
                -adjustedPrismHeight / 2, // Center the image vertically
                adjustedPrismWidth,
                adjustedPrismHeight
              );
            } else {
              // Fallback to drawing a triangle shape if image isn't available
              const halfWidth = adjustedPrismWidth / 2;
              const halfHeight = adjustedPrismHeight / 2;
              
              // Create a semi-transparent blue triangle
              ctx3.beginPath();
              ctx3.moveTo(0, -halfHeight); // Top point
              ctx3.lineTo(halfWidth, halfHeight); // Bottom right
              ctx3.lineTo(-halfWidth, halfHeight); // Bottom left
              ctx3.closePath();
              
              // Fill with semi-transparent blue color
              ctx3.fillStyle = 'rgba(173, 216, 230, 0.5)';
              ctx3.fill();
              
              // Add a border
              ctx3.strokeStyle = 'rgba(100, 150, 200, 0.8)';
              ctx3.lineWidth = 2;
              ctx3.stroke();
            }
            
            // Draw prism value text
            ctx3.font = '14px Arial';
            ctx3.fillStyle = 'white';
            ctx3.textAlign = 'center';
            ctx3.fillText(`${prism.value}Δ`, 0, -adjustedPrismHeight / 2 - 10);
            
            // Draw prism axis indicator line
            ctx3.beginPath();
            ctx3.moveTo(0, 0);
            ctx3.lineTo(0, -adjustedPrismHeight * 0.7);
            ctx3.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx3.lineWidth = 2;
            ctx3.stroke();
            
            // Restore the context to its original state
            ctx3.restore();
          }

          // 7. Draw UI overlay on layer 4
          ctx4.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx4.fillRect(10, 10, 80, 60);
          ctx4.fillStyle = 'white';
          ctx4.font = '14px Arial';
          ctx4.fillText('OD', 20, 30);
          ctx4.fillText('OS', 50, 30);
          
          // Show prism measurements
          const xDelta = Math.round(esotropia - exotropia);
          const yDelta = Math.round(hypertropia - hypotropia);
          ctx4.fillText(`X: ${xDelta === 0 ? '0' : xDelta > 0 ? '+' + xDelta : xDelta}Δ`, 20, 50);
          ctx4.fillText(`Y: ${yDelta === 0 ? '0' : yDelta > 0 ? '+' + yDelta : yDelta}Δ`, 20, 65);
          
          // Add a gaze direction indicator when target tool is active
          if (target.active) {
            // Position the indicator in top right corner
            const indicatorX = canvasSize.width - 100;
            const indicatorY = 50;
            const indicatorRadius = 30;
            
            // Draw circular background
            ctx4.beginPath();
            ctx4.arc(indicatorX, indicatorY, indicatorRadius, 0, Math.PI * 2);
            ctx4.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx4.fill();
            
            // Draw crosshairs
            ctx4.beginPath();
            ctx4.moveTo(indicatorX - indicatorRadius, indicatorY);
            ctx4.lineTo(indicatorX + indicatorRadius, indicatorY);
            ctx4.moveTo(indicatorX, indicatorY - indicatorRadius);
            ctx4.lineTo(indicatorX, indicatorY + indicatorRadius);
            ctx4.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx4.lineWidth = 1;
            ctx4.stroke();
            
            // Calculate gaze direction from eye positions
            // Use iris position directly for direction indicator
            const dirX = irisPosition.left.x * 25; // Scale factor for visualization
            const dirY = irisPosition.left.y * 25;
            
            // Draw direction indicator
            ctx4.beginPath();
            ctx4.arc(indicatorX + dirX, indicatorY + dirY, 5, 0, Math.PI * 2);
            ctx4.fillStyle = '#f05658';
            ctx4.fill();
            
            // Label the indicator
            ctx4.fillStyle = 'white';
            ctx4.font = '12px Arial';
            ctx4.textAlign = 'center';
            ctx4.fillText('Gaze', indicatorX, indicatorY - indicatorRadius - 10);
          }
        }
      } catch (error) {
        console.error('Error drawing canvas:', error);
        setHasError(true);
      }

      // Schedule next frame
      animationFrameRef.current = requestAnimationFrame(drawFrame);
    };

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(drawFrame);

    // Clean up animation on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    canvasSize,
    imagesLoaded,
    assets,
    eyePositions,
    occluder,
    target,
    eyeCenterOD,
    eyeCenterOS,
    esotropia,
    exotropia,
    hypertropia,
    hypotropia,
    occluderPosition,
    pupilSize,
    irisColor,
    eyeSize,
    prism,
    prismValue,
    prismAxis,
    irisPosition,
    eyePosition,
    pupilPosition
  ]);

  // Handler for occluder tool button
  const handleOccluderToggle = () => {
    if (activeTool === 'occluder') {
      setActiveTool(null);
      setStoreActiveTool('none');
      setOccluderPosition(null);
      
      // Reset iris positions to deviation settings only
      const horizontalScale = 2;
      const verticalScale = 2;
      
      // Calculate tropias for left eye
      const leftXOffset = (esotropia * horizontalScale) - (exotropia * horizontalScale);
      const leftYOffset = -(hypertropia * verticalScale) + (hypotropia * verticalScale);
      
      // Calculate tropias for right eye
      const rightXOffset = -(esotropia * horizontalScale) + (exotropia * horizontalScale);
      const rightYOffset = -(hypertropia * verticalScale) + (hypotropia * verticalScale);
      
      // Apply to iris positions
      setIrisPosition('left', { x: leftXOffset/10, y: leftYOffset/10 });
      setIrisPosition('right', { x: rightXOffset/10, y: rightYOffset/10 });
    } else {
      setActiveTool('occluder');
      setStoreActiveTool('occluder');
    }
  };

  // Handler for target tool button
  const handleTargetToggle = () => {
    if (activeTool === 'target') {
      setActiveTool(null);
      setStoreActiveTool('none');
      setTarget(prev => ({ ...prev, active: false }));
      
      // Reset iris positions to deviation settings only
      const horizontalScale = 2;
      const verticalScale = 2;
      
      // Calculate tropias for left eye
      const leftXOffset = (esotropia * horizontalScale) - (exotropia * horizontalScale);
      const leftYOffset = -(hypertropia * verticalScale) + (hypotropia * verticalScale);
      
      // Calculate tropias for right eye
      const rightXOffset = -(esotropia * horizontalScale) + (exotropia * horizontalScale);
      const rightYOffset = -(hypertropia * verticalScale) + (hypotropia * verticalScale);
      
      // Apply to iris positions
      setIrisPosition('left', { x: leftXOffset/10, y: leftYOffset/10 });
      setIrisPosition('right', { x: rightXOffset/10, y: rightYOffset/10 });
    } else {
      setActiveTool('target');
      setStoreActiveTool('target');
      setTarget(prev => ({ ...prev, active: true }));
    }
  };

  // Handler for prism tool button
  const handlePrismToggle = () => {
    if (activeTool === 'prism') {
      setActiveTool(null);
      setStoreActiveTool('none');
      setPrism(prev => ({ ...prev, active: false }));
      
      // Reset iris positions to deviation settings only
      const horizontalScale = 2;
      const verticalScale = 2;
      
      // Calculate tropias for left eye
      const leftXOffset = (esotropia * horizontalScale) - (exotropia * horizontalScale);
      const leftYOffset = -(hypertropia * verticalScale) + (hypotropia * verticalScale);
      
      // Calculate tropias for right eye
      const rightXOffset = -(esotropia * horizontalScale) + (exotropia * horizontalScale);
      const rightYOffset = -(hypertropia * verticalScale) + (hypotropia * verticalScale);
      
      // Apply to iris positions
      setIrisPosition('left', { x: leftXOffset/10, y: leftYOffset/10 });
      setIrisPosition('right', { x: rightXOffset/10, y: rightYOffset/10 });
    } else {
      setActiveTool('prism');
      setStoreActiveTool('prism');
      setPrism(prev => ({ ...prev, active: true }));
    }
  };

  if (hasError) {
    return (
      <ErrorOverlay>
        <h3>2.5D View Unavailable</h3>
        <p>There was a problem loading or rendering the 2.5D view.</p>
        <p>Please try refreshing the page or contact support if the issue persists.</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: '15px',
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh Page
        </button>
      </ErrorOverlay>
    );
  }

  return (
    <Container ref={containerRef}>
      <Canvas ref={canvasRef1} /> {/* Eyes base and face */}
      <Canvas ref={canvasRef2} /> {/* Pupils and light reflex */}
      <Canvas ref={canvasRef3} /> {/* Tools layer */}
      <Canvas ref={canvasRef4} /> {/* UI elements layer */}
      
      {/* Add visual feedback when dragging tools */}
      {feedback && (
        <DragFeedback>
          <span>{feedback}</span>
        </DragFeedback>
      )}
      
      <ControlsOverlay>
        <ToolButton 
          active={activeTool === 'occluder'} 
          onClick={handleOccluderToggle}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a10 10 0 0 1 0 20" />
          </svg>
          Occluder
        </ToolButton>
        
        <ToolButton 
          active={activeTool === 'target'} 
          onClick={handleTargetToggle}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          Target
        </ToolButton>

        <ToolButton 
          active={activeTool === 'prism'} 
          onClick={handlePrismToggle}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 19h20L12 2z" />
            <path d="M12 19v-6" />
          </svg>
          Prism
        </ToolButton>
      </ControlsOverlay>
      
      {!imagesLoaded && (
        <LoadingOverlay>
          <div style={{ marginBottom: '15px', fontSize: '18px' }}>
            Loading 2.5D View...
          </div>
          <div style={{ 
            width: '250px', 
            height: '8px', 
            backgroundColor: '#e2e8f0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${loadingProgress}%`, 
              height: '100%', 
              backgroundColor: '#3b82f6',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#64748b' }}>
            {loadingProgress}%
          </div>
        </LoadingOverlay>
      )}
    </Container>
  );
};

export default TwoDotFiveModel; 