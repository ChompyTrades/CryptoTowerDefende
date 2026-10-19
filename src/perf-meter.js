// Opt-in local QA overlay. No telemetry and no change to simulation/rendering.
export function performanceMeter(enabled=false){
 if(!enabled)return ()=>{};
 const output=document.createElement('output');output.id='performance-meter';output.style.cssText='position:fixed;bottom:6px;left:6px;z-index:9999;background:#142b22ee;color:#fff3c6;font:12px monospace;padding:6px;pointer-events:none';document.body.append(output);
 const render=[],gaps=[];let previous=0,updated=0;
 return (now,duration,wave)=>{if(previous)gaps.push(now-previous);previous=now;render.push(duration);if(render.length>600)render.shift();if(gaps.length>600)gaps.shift();if(now-updated<1000)return;updated=now;
  const p95=a=>a.toSorted((x,y)=>x-y)[Math.floor(a.length*.95)]||0;
  output.textContent=`LOCAL QA · W${wave} · render p95 ${p95(render).toFixed(1)}ms · frame gap p95 ${p95(gaps).toFixed(1)}ms · ${render.length} samples`;
 };
}
