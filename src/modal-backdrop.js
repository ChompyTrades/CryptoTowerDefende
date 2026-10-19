// A finished victory cannot resume simulation by merely hiding its result dialog.
export function handleModalBackdrop(event,{modal,started,phase,kind,showEnd,save,close,showMenu}){
 const r=modal.getBoundingClientRect();if(event.target!==modal||!(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))return;
 if(started){if(phase==='victory'||kind==='share'){showEnd();return;}if(kind==='settings')save();close();}else if(kind!=='menu')showMenu();
}
