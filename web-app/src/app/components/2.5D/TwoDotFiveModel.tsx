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
  const [activeTool, setActiveTool] = useState<'occluder' | 'target' | null>(null);
  const [occluder, setOccluder] = useState<Tool>({ 
    x: eyeCenterOD.x, y: eyeCenterOD.y, width: 200, height: 200, active: false, dragging: false 
  });
  const [target, setTarget] = useState<Tool>({ 
    x: 450, y: 80, width: 130, height: 570, active: false, dragging: false 
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
    setIrisPosition
  } = useEyeStore();

  // Animation loop reference
  const animationFrameRef = useRef<number | null>(null);
  
  // Sync tool state with store
  useEffect(() => {
    if (storeActiveTool === 'occluder') {
      setActiveTool('occluder');
      setOccluder(prev => ({ ...prev, active: true }));
    } else if (storeActiveTool === 'target') {
      setActiveTool('target');
      setTarget(prev => ({ ...prev, active: true }));
    } else {
      setActiveTool(null);
      setOccluder(prev => ({ ...prev, active: false }));
      setTarget(prev => ({ ...prev, active: false }));
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

  // Load images once on component mount
  useEffect(() => {
    const imageList = [
      { name: 'face', src: '/images/2.5D-new/n_face_sm.png' },
      { name: 'eye', src: '/images/2.5D-new/n_eye.png' },
      { name: 'plainEye', src: '/images/2.5D-new/n_eye_plain.png' },
      { name: 'occluder', src: '/images/2.5D-new/n_cover.png' },
      { name: 'target', src: '/images/2.5D-new/target_stick.png' },
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
      setHasError(true);
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
    if (!canvasRef3.current) return;

    const canvas = canvasRef3.current;

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;

      // Calculate face image dimensions to maintain aspect ratio (same as in drawFrame)
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
        
        // Calculate occluder and target positions
        const adjustedOccluderX = occluder.x * eyeAdjustScaleX + offsetX;
        const adjustedOccluderY = occluder.y * eyeAdjustScaleY + offsetY;
        const adjustedOccluderWidth = occluder.width * eyeAdjustScaleX;
        const adjustedOccluderHeight = occluder.height * eyeAdjustScaleY;

        const adjustedTargetX = target.x * eyeAdjustScaleX + offsetX;
        const adjustedTargetY = target.y * eyeAdjustScaleY + offsetY;
        const adjustedTargetWidth = target.width * eyeAdjustScaleX;
        const adjustedTargetHeight = target.height * eyeAdjustScaleY;

        // Check if occluder is clicked (using adjusted positions)
        if (
          activeTool === 'occluder' &&
          occluder.active &&
          mouseX >= adjustedOccluderX - adjustedOccluderWidth / 2 &&
          mouseX <= adjustedOccluderX + adjustedOccluderWidth / 2 &&
          mouseY >= adjustedOccluderY - adjustedOccluderHeight / 2 &&
          mouseY <= adjustedOccluderY + adjustedOccluderHeight / 2
        ) {
          setOccluder(prev => ({ ...prev, dragging: true }));
          dragStartRef.current = { 
            x: mouseX - adjustedOccluderX, 
            y: mouseY - adjustedOccluderY 
          };
        }
        
        // Check if target is clicked (using adjusted positions)
        if (
          activeTool === 'target' &&
          target.active &&
          mouseX >= adjustedTargetX - adjustedTargetWidth / 2 &&
          mouseX <= adjustedTargetX + adjustedTargetWidth / 2 &&
          mouseY >= adjustedTargetY &&
          mouseY <= adjustedTargetY + adjustedTargetHeight
        ) {
          setTarget(prev => ({ ...prev, dragging: true }));
          dragStartRef.current = { 
            x: mouseX - adjustedTargetX, 
            y: mouseY - adjustedTargetY 
          };
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;

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
          const originalX = (mouseX - offsetX) / eyeAdjustScaleX;
          const originalY = (mouseY - offsetY) / eyeAdjustScaleY;
          const newX = originalX - dragStartRef.current.x / eyeAdjustScaleX;
          const newY = originalY - dragStartRef.current.y / eyeAdjustScaleY;
          
          setOccluder(prev => ({ ...prev, x: newX, y: newY }));
          
          // Determine which eye is covered (using adjusted positions)
          const leftDist = Math.hypot(
            mouseX - adjustedEyeCenterOD.x, 
            mouseY - adjustedEyeCenterOD.y
          );
          const rightDist = Math.hypot(
            mouseX - adjustedEyeCenterOS.x, 
            mouseY - adjustedEyeCenterOS.y
          );
          
          if (leftDist < rightDist && leftDist < 100 * Math.min(eyeAdjustScaleX, eyeAdjustScaleY)) {
            setOccluderPosition('left');
          } else if (rightDist < 100 * Math.min(eyeAdjustScaleX, eyeAdjustScaleY)) {
            setOccluderPosition('right');
          } else {
            setOccluderPosition(null);
          }
        }
        
        // Move target if dragging
        if (target.dragging) {
          // First convert mouse position back to original coordinate space
          const originalX = (mouseX - offsetX) / eyeAdjustScaleX;
          const originalY = (mouseY - offsetY) / eyeAdjustScaleY;
          const newX = originalX - dragStartRef.current.x / eyeAdjustScaleX;
          const newY = originalY - dragStartRef.current.y / eyeAdjustScaleY;
          
          setTarget(prev => ({ ...prev, x: newX, y: newY }));
        }
      }
    };

    const handleMouseUp = () => {
      setOccluder(prev => ({ ...prev, dragging: false }));
      setTarget(prev => ({ ...prev, dragging: false }));
    };

    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseout', handleMouseUp);

    return () => {
      // Remove event listeners
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseout', handleMouseUp);
    };
  }, [
    activeTool, 
    occluder, 
    target, 
    eyeCenterOD, 
    eyeCenterOS, 
    setOccluderPosition, 
    assets.face, 
    canvasSize
  ]);

  // Calculate eye positions based on deviations and store values
  useEffect(() => {
    // Scale factor to convert prismatic diopters to pixels
    const horizontalScale = 2;
    const verticalScale = 2;

    const newEyePositions = {
      left: {
        x: eyeCenterOD.x,
        y: eyeCenterOD.y,
        pupilOffsetX: 0, // We'll now use direct irisPosition and pupilPosition for drawing
        pupilOffsetY: 0
      },
      right: {
        x: eyeCenterOS.x,
        y: eyeCenterOS.y,
        pupilOffsetX: 0, // We'll now use direct irisPosition and pupilPosition for drawing
        pupilOffsetY: 0
      }
    };

    // Apply manifest deviations (tropias) to both eyes by updating the eye store
    // This ensures the controls show the correct deviations
    
    // Left eye horizontal deviations
    const leftXOffset = (esotropia * horizontalScale) - (exotropia * horizontalScale);
    // Handle deviation through the store - this will be used for UI display and pupil position
    if (leftXOffset !== 0) {
      const newX = irisPosition.left.x + leftXOffset/10;
      setIrisPosition('left', { x: newX, y: irisPosition.left.y });
    }

    // Left eye vertical deviations
    const leftYOffset = -(hypertropia * verticalScale) + (hypotropia * verticalScale);
    if (leftYOffset !== 0) {
      const newY = irisPosition.left.y + leftYOffset/10;
      setIrisPosition('left', { x: irisPosition.left.x, y: newY });
    }

    // Right eye horizontal deviations
    const rightXOffset = -(esotropia * horizontalScale) + (exotropia * horizontalScale);
    if (rightXOffset !== 0) {
      const newX = irisPosition.right.x + rightXOffset/10;
      setIrisPosition('right', { x: newX, y: irisPosition.right.y });
    }

    // Right eye vertical deviations
    const rightYOffset = -(hypertropia * verticalScale) + (hypotropia * verticalScale);
    if (rightYOffset !== 0) {
      const newY = irisPosition.right.y + rightYOffset/10;
      setIrisPosition('right', { x: irisPosition.right.x, y: newY });
    }

    // Apply latent deviations (phorias) when eye is covered
    if (occluderPosition === 'left') {
      const leftPhoriaX = (esophoria * horizontalScale) - (exophoria * horizontalScale);
      const leftPhoriaY = -(hyperphoria * verticalScale) + (hypophoria * verticalScale);
      if (leftPhoriaX !== 0 || leftPhoriaY !== 0) {
        const newX = irisPosition.left.x + leftPhoriaX/10;
        const newY = irisPosition.left.y + leftPhoriaY/10;
        setIrisPosition('left', { x: newX, y: newY });
      }
    }

    if (occluderPosition === 'right') {
      const rightPhoriaX = -(esophoria * horizontalScale) + (exophoria * horizontalScale);
      const rightPhoriaY = -(hyperphoria * verticalScale) + (hypophoria * verticalScale);
      if (rightPhoriaX !== 0 || rightPhoriaY !== 0) {
        const newX = irisPosition.right.x + rightPhoriaX/10;
        const newY = irisPosition.right.y + rightPhoriaY/10;
        setIrisPosition('right', { x: newX, y: newY });
      }
    }

    setEyePositions(newEyePositions);
  }, [
    eyeCenterOD,
    eyeCenterOS,
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
    setIrisPosition
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
            
            // Calculate iris position
            const irisOffsetX = (eyePosition.left.x * 20 + irisPosition.left.x * 15) * eyeAdjustScaleX;
            const irisOffsetY = (eyePosition.left.y * 20 + irisPosition.left.y * 10) * eyeAdjustScaleY;
            
            // Draw left iris directly without the sclera (white part)
            ctx2.beginPath();
            ctx2.fillStyle = irisColor.left;
            ctx2.arc(
              adjustedEyeCenterOD.x + irisOffsetX,
              adjustedEyeCenterOD.y + irisOffsetY,
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
              adjustedEyeCenterOD.x + irisOffsetX + pupilOffsetX,
              adjustedEyeCenterOD.y + irisOffsetY + pupilOffsetY,
              pupilRadius,  // Use the calculated pupil radius directly
              0, Math.PI * 2
            );
            ctx2.fill();
            
            // Add light reflex for left eye
            ctx2.beginPath();
            ctx2.fillStyle = '#ffffff';
            ctx2.arc(
              adjustedEyeCenterOD.x + irisOffsetX + pupilOffsetX + 2 * eyeAdjustScaleX,
              adjustedEyeCenterOD.y + irisOffsetY + pupilOffsetY - 2 * eyeAdjustScaleY,
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
            
            // Calculate iris position
            const irisOffsetX = (eyePosition.right.x * 20 + irisPosition.right.x * 15) * eyeAdjustScaleX;
            const irisOffsetY = (eyePosition.right.y * 20 + irisPosition.right.y * 10) * eyeAdjustScaleY;
            
            // Draw right iris directly without the sclera (white part)
            ctx2.beginPath();
            ctx2.fillStyle = irisColor.right;
            ctx2.arc(
              adjustedEyeCenterOS.x + irisOffsetX,
              adjustedEyeCenterOS.y + irisOffsetY,
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
              adjustedEyeCenterOS.x + irisOffsetX + pupilOffsetX,
              adjustedEyeCenterOS.y + irisOffsetY + pupilOffsetY,
              rightPupilRadius,  // Use the calculated pupil radius for right eye
              0, Math.PI * 2
            );
            ctx2.fill();
            
            // Add light reflex for right eye
            ctx2.beginPath();
            ctx2.fillStyle = '#ffffff';
            ctx2.arc(
              adjustedEyeCenterOS.x + irisOffsetX + pupilOffsetX + 2 * eyeAdjustScaleX,
              adjustedEyeCenterOS.y + irisOffsetY + pupilOffsetY - 2 * eyeAdjustScaleY,
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
    eyeSize
  ]);

  // Handler for occluder tool button
  const handleOccluderToggle = () => {
    if (activeTool === 'occluder') {
      setActiveTool(null);
      setStoreActiveTool('none');
      setOccluderPosition(null);
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
    } else {
      setActiveTool('target');
      setStoreActiveTool('target');
      setTarget(prev => ({ ...prev, active: true }));
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