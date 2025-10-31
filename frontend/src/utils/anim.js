export const fadeUp=(d=0)=>({hidden:{opacity:0,y:20},show:{opacity:1,y:0,transition:{duration:0.6,delay:d,ease:'easeOut'}}});
export const stagger=(d=0.15)=>({hidden:{},show:{transition:{staggerChildren:d}}});
