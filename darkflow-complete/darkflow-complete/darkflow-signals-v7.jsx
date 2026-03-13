import { useState, useEffect } from "react";

const C={bg:"#080810",surface:"#0c0c18",raised:"#10101f",border:"#1c1c30",borderM:"#252540",text:"#e8e8f0",muted2:"#8888a8",muted:"#444460",accent:"#00d4aa",red:"#f04060",gold:"#f0c040"};

const LIVE_SIGNALS = [
  {
    ticker:"SPX",direction:"BULL",headline:"King Node $5,725 acting as magnet — pin trade",
    confidence:74,timeframe:"INTRADAY",expiryUrgency:"HIGH",
    tags:["GEX","KING NODE","REGIME"],
    reasoning:"Spot at $5,718 is within 7pts of King Node $5,725 — the largest absolute GEX strike. Dealer hedging at this level suppresses realized volatility, creating ideal conditions for a mean-reversion long. Positive gamma regime means dealers buy dips, providing a natural bid.",
    setup:"SPX 0DTE 5720/5740 Call Spread",entry:"Open or first dip to $5,710",target:"$5,740–$5,750 Call Wall",stop:"Break below $5,700 on volume",
    confluenceFactors:[{label:"GEX STRUCTURE",score:88},{label:"OPTIONS FLOW",score:65},{label:"DARK POOL",score:72},{label:"REGIME ALIGN",score:91}]
  },
  {
    ticker:"SPY",direction:"BEAR",headline:"Institutional put block signals defensive hedge",
    confidence:68,timeframe:"SWING",expiryUrgency:"MEDIUM",
    tags:["FLOW","DARK POOL","SWEEP"],
    reasoning:"$1.8M QQQ put block alongside SPY dark pool print of 4.2M shares at $571.40 suggests institutional positioning for downside. If SPX fails to hold above gamma flip at $5,735, dealers flip short gamma and amplify moves lower toward $5,680 put wall.",
    setup:"SPY Put debit spread, 1–2 weeks out",entry:"SPX rejection at $5,735 flip level",target:"$5,680 Put Wall ($568 SPY)",stop:"SPX reclaims and holds $5,740",
    confluenceFactors:[{label:"GEX STRUCTURE",score:71},{label:"OPTIONS FLOW",score:84},{label:"DARK POOL",score:79},{label:"REGIME ALIGN",score:55}]
  },
  {
    ticker:"NVDA",direction:"BULL",headline:"$890K call sweep — conviction buying into strength",
    confidence:81,timeframe:"0DTE",expiryUrgency:"HIGH",
    tags:["SWEEP","0DTE","FLOW"],
    reasoning:"A $890K call sweep in NVDA is a high-conviction directional bet — not a hedge. Size and urgency of the sweep (market order, single leg) indicates informed flow expecting an intraday move. Positive SPX gamma regime reduces macro drag on individual names.",
    setup:"NVDA 0DTE ATM Call or tight call spread",entry:"Within 0.5% of current price on open",target:"+1.5% to +2.5% intraday move",stop:"Position size-based — max 1R loss",
    confluenceFactors:[{label:"GEX STRUCTURE",score:62},{label:"OPTIONS FLOW",score:93},{label:"DARK POOL",score:58},{label:"REGIME ALIGN",score:77}]
  },
  {
    ticker:"SPX",direction:"NEUTRAL",headline:"Gamma compression — spot pinned at HVL zone",
    confidence:71,timeframe:"INTRADAY",expiryUrgency:"HIGH",
    tags:["GEX","HVL","REGIME","VANNA"],
    reasoning:"SPX is 17pts below the gamma flip at $5,735 and 7pts below King Node $5,725. This HVL compression zone suppresses directional movement — dealers are neither strongly long nor short gamma here. Best trade is selling premium into the pin rather than buying directional.",
    setup:"SPX 0DTE Iron Condor or short strangle",entry:"Sell when IV elevated on open",target:"Full premium decay by close",stop:"SPX moves more than 20pts in either direction",
    confluenceFactors:[{label:"GEX STRUCTURE",score:85},{label:"OPTIONS FLOW",score:60},{label:"DARK POOL",score:55},{label:"REGIME ALIGN",score:80}]
  }
];

function Card({s,i}){
  const[open,setOpen]=useState(false);
  const dc=s.direction==="BULL"?C.accent:s.direction==="BEAR"?C.red:C.gold;
  const conf=Math.min(100,Math.max(0,s.confidence||50));
  const urg=s.expiryUrgency==="HIGH"?"EXPIRES TODAY":s.expiryUrgency==="MEDIUM"?"EXPIRES THIS WEEK":"SWING SETUP";
  const urgC=s.expiryUrgency==="HIGH"?C.red:s.expiryUrgency==="MEDIUM"?C.gold:C.muted;
  const dir=s.direction==="BULL"?"↑ BULLISH":s.direction==="BEAR"?"↓ BEARISH":"→ NEUTRAL";
  return <div style={{background:C.surface,border:`1px solid ${C.border}`,borderLeft:`3px solid ${dc}`,borderRadius:6,overflow:"hidden",animation:`cardIn .3s ease ${i*.08}s both`}}>
    <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px 8px",cursor:"pointer"}}>
      <div style={{fontSize:14,fontWeight:600,color:C.text,minWidth:52}}>{s.ticker}</div>
      <div style={{padding:"2px 7px",borderRadius:2,fontSize:8,fontWeight:600,background:`${dc}18`,color:dc,border:`1px solid ${dc}40`,flexShrink:0}}>{dir}</div>
      <div style={{flex:1,fontSize:10,color:C.muted2,lineHeight:1.4,minWidth:0}}>{s.headline}</div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,flexShrink:0}}>
        <span style={{fontSize:7,color:C.muted}}>CONFIDENCE</span>
        <div style={{width:40,height:4,background:C.raised,borderRadius:2,overflow:"hidden"}}><div style={{width:`${conf}%`,height:"100%",background:conf>=75?C.accent:conf>=55?C.gold:C.muted2}}/></div>
      </div>
    </div>
    <div style={{display:"flex",gap:6,padding:"0 14px 10px",flexWrap:"wrap",alignItems:"center"}}>
      {[s.timeframe,...(s.tags||[]).slice(0,3)].map((t,j)=><span key={j} style={{height:18,padding:"0 7px",borderRadius:2,fontSize:7,fontWeight:600,background:C.raised,border:`1px solid ${C.borderM}`,color:C.muted2,display:"flex",alignItems:"center"}}>{t}</span>)}
      <span style={{marginLeft:"auto",fontSize:8,color:urgC}}>{urg}</span>
    </div>
    {open&&<div style={{borderTop:`1px solid ${C.border}`,padding:14,display:"flex",flexDirection:"column",gap:12}}>
      <div><div style={{fontSize:7,fontWeight:600,color:C.muted,marginBottom:4}}>ANALYSIS</div><div style={{fontSize:9,color:C.muted2,lineHeight:1.7}}>{s.reasoning}</div></div>
      <div>
        <div style={{fontSize:7,fontWeight:600,color:C.muted,marginBottom:4}}>TRADE SETUP</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
          {[["STRATEGY",s.setup,C.muted2,9],["ENTRY",s.entry,C.accent,10],["TARGET",s.target,C.accent,10],["STOP",s.stop,C.red,10]].map(([l,v,c,fs])=>
            <div key={l} style={{background:C.raised,border:`1px solid ${C.border}`,borderRadius:3,padding:"6px 10px"}}>
              <div style={{fontSize:7,color:C.muted,marginBottom:2}}>{l}</div>
              <div style={{fontSize:fs,fontWeight:500,color:c,lineHeight:1.3}}>{v}</div>
            </div>
          )}
        </div>
      </div>
      <div>
        <div style={{fontSize:7,fontWeight:600,color:C.muted,marginBottom:5}}>CONFLUENCE</div>
        {(s.confluenceFactors||[]).map(f=>{const fc=f.score>=75?C.accent:f.score>=55?C.gold:C.muted2;return(
          <div key={f.label} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <span style={{fontSize:8,color:C.muted,width:95,flexShrink:0}}>{f.label}</span>
            <div style={{flex:1,height:3,background:C.raised,borderRadius:2,overflow:"hidden"}}><div style={{width:`${f.score}%`,height:"100%",background:fc}}/></div>
            <span style={{fontSize:8,fontWeight:600,color:fc,width:26,textAlign:"right"}}>{f.score}</span>
          </div>
        );})}
      </div>
      <div style={{display:"flex",gap:8}}>
        <button style={{flex:1,height:32,borderRadius:3,fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"IBM Plex Mono",background:"transparent",border:`1px solid ${C.borderM}`,color:C.muted2}}>+ WATCHLIST</button>
        <button style={{flex:1,height:32,borderRadius:3,fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"IBM Plex Mono",background:`${C.accent}14`,border:`1px solid ${C.accent}50`,color:C.accent}}>🔔 SET ALERT</button>
      </div>
    </div>}
  </div>;
}

export default function DarkflowV7(){
  const[filter,setFilter]=useState("ALL");
  const[clock,setClock]=useState("");
  useEffect(()=>{const t=setInterval(()=>setClock(new Date().toLocaleTimeString("en-US",{hour12:false})),1000);return()=>clearInterval(t);},[]);
  const shown=filter==="ALL"?LIVE_SIGNALS:LIVE_SIGNALS.filter(s=>s.direction===filter);

  return <div style={{display:"flex",flexDirection:"column",height:"100vh",background:C.bg,fontFamily:"IBM Plex Mono,monospace",overflow:"hidden"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:wght@600&display=swap');@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}@keyframes cardIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:#252540}`}</style>

    {/* NAV */}
    <div style={{flexShrink:0,height:44,background:C.surface,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",padding:"0 16px",gap:16}}>
      <div style={{fontFamily:"IBM Plex Sans",fontWeight:600,fontSize:13,letterSpacing:".12em",color:C.accent,display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:0,height:0,borderLeft:"8px solid transparent",borderRight:"8px solid transparent",borderBottom:`14px solid ${C.accent}`}}/>DARKFLOW
      </div>
      <div style={{display:"flex",height:"100%",overflowX:"auto"}}>
        {["OVERVIEW","FLOW","GEX","NET DRIFT","DARK POOL","CHAIN","JOURNAL","AI SIGNALS"].map(t=>
          <div key={t} style={{height:"100%",padding:"0 12px",display:"flex",alignItems:"center",fontSize:10,whiteSpace:"nowrap",color:t==="AI SIGNALS"?C.accent:C.muted,borderBottom:t==="AI SIGNALS"?`2px solid ${C.accent}`:"2px solid transparent"}}>{t}</div>
        )}
      </div>
      <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:C.accent,boxShadow:`0 0 6px ${C.accent}`,animation:"pulse 2s infinite"}}/>
        <span style={{fontSize:10,color:C.muted2}}>{clock}</span>
      </div>
    </div>

    {/* SIGNALS HEADER */}
    <div style={{flexShrink:0,height:44,background:C.surface,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",padding:"0 16px",gap:10}}>
      <span style={{fontSize:10,fontWeight:600,color:C.muted2}}>AI SIGNALS</span>
      <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 9px",background:`${C.accent}14`,border:`1px solid ${C.accent}30`,borderRadius:3}}>
        <div style={{width:5,height:5,borderRadius:"50%",background:C.accent,animation:"pulse 2s infinite"}}/>
        <span style={{fontSize:8,fontWeight:600,color:C.accent}}>CLAUDE SONNET · LIVE</span>
      </div>
      <div style={{marginLeft:"auto",display:"flex",gap:6,alignItems:"center"}}>
        {["ALL","BULL","BEAR","NEUTRAL"].map(f=>
          <button key={f} onClick={()=>setFilter(f)} style={{height:26,padding:"0 10px",borderRadius:3,fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"IBM Plex Mono",background:filter===f?`${C.accent}12`:"transparent",border:`1px solid ${filter===f?C.accent:C.border}`,color:filter===f?C.accent:C.muted}}>
            {f==="BULL"?"BULLISH":f==="BEAR"?"BEARISH":f}
          </button>
        )}
      </div>
    </div>

    {/* CONTEXT */}
    <div style={{flexShrink:0,padding:"6px 16px",background:C.bg,borderBottom:`1px solid ${C.border}`,display:"flex",gap:10,fontSize:8,color:C.muted,alignItems:"center",flexWrap:"wrap"}}>
      <span>SPX <span style={{color:C.red,fontWeight:500}}>$5,718 (-0.34%)</span></span>
      <span style={{width:1,height:10,background:C.border,display:"inline-block"}}/>
      <span>VIX <span style={{color:C.muted2,fontWeight:500}}>18.4</span></span>
      <span style={{width:1,height:10,background:C.border,display:"inline-block"}}/>
      <span>REGIME <span style={{color:C.accent,fontWeight:500}}>POSITIVE GAMMA</span></span>
      <span style={{width:1,height:10,background:C.border,display:"inline-block"}}/>
      <span>FLIP <span style={{color:C.gold,fontWeight:500}}>$5,735</span></span>
      <span style={{marginLeft:"auto",color:C.muted}}>ASK CLAUDE TO REFRESH SIGNALS</span>
    </div>

    {/* BODY */}
    <div style={{flex:1,overflowY:"auto",padding:"12px 16px",display:"flex",flexDirection:"column",gap:10,WebkitOverflowScrolling:"touch"}}>
      {shown.map((s,i)=><Card key={i} s={s} i={i}/>)}
    </div>
  </div>;
}
