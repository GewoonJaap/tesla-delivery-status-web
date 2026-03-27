import React, { useState, useRef, cloneElement } from 'react';
import {
  useFloating,
  useHover,
  useInteractions,
  useTransitionStyles,
  offset,
  flip,
  shift,
  arrow,
  autoUpdate,
  FloatingPortal,
  Placement,
} from '@floating-ui/react';

interface TooltipProps {
  text: string;
  children: React.ReactElement;
  placement?: Placement;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, placement = 'top' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = useRef(null);

  const { x, y, refs, strategy, context, middlewareData, placement: finalPlacement } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: placement as Placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(10),
      flip({ fallbackAxisSideDirection: 'start', crossAxis: false }),
      shift({ padding: 8 }),
      arrow({ element: arrowRef }),
    ],
  });
  
  const hover = useHover(context, { move: false, delay: { open: 100, close: 0 } });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
      duration: 200,
      initial: {
          opacity: 0,
          transform: 'scale(0.95)',
      },
      open: {
          opacity: 1,
          transform: 'scale(1)',
      },
      close: {
          opacity: 0,
          transform: 'scale(0.95)',
      }
  });

  const staticSide = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
  }[finalPlacement.split('-')[0] as 'top' | 'right' | 'bottom' | 'left'];
  
  const arrowStyles = middlewareData.arrow ? {
    left: `${middlewareData.arrow.x}px`,
    top: `${middlewareData.arrow.y}px`,
    // Fix: Use the correctly typed `staticSide` without a fallback.
    [staticSide]: '-4px',
  } : {};

  // Fix: The spread operator `...transitionStyles` can cause a TypeScript error in certain toolchain configurations.
  // Merging the style objects explicitly with Object.assign is a more robust workaround.
  const style = Object.assign(
    {
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
    },
    transitionStyles
  );

  return (
    <>
      {/* Fix: The spread operator `...children.props` can cause a TypeScript error.
          Using Object.assign is a more robust way to merge props. */}
      {cloneElement(children, getReferenceProps(Object.assign({ ref: refs.setReference }, children.props)))}
      {isMounted && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={style}
            {...getFloatingProps()}
            className="w-max max-w-xs p-2.5 text-xs font-semibold text-white bg-gray-900 dark:bg-black rounded-lg shadow-lg z-[9999]"
            role="tooltip"
          >
            {text}
            <div
                ref={arrowRef}
                className="absolute h-2 w-2 rotate-45 bg-gray-900 dark:bg-black"
                style={arrowStyles}
            />
          </div>
        </FloatingPortal>
      )}
    </>
  );
};

export default Tooltip;