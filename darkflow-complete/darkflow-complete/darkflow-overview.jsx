import { useState, useEffect } from "react";

const C={bg:"#080810",surface:"#0c0c18",raised:"#10101f",border:"#1c1c30",borderM:"#252540",text:"#e8e8f0",dim:"#b0b0c8",muted2:"#8888a8",muted:"#444460",accent:"#00d4aa",red:"#f04060",gold:"#f0c040",blue:"#4888ff",orange:"#ff8040"};

// ── MOCK DATA ────────────────────────────────────────────────
const DATA = {
  spx: 5718.40, spxChg: -0.34, spxChgPts: -19.6,
  vix: 18.4, vixChg: +0.8,
  netGex: 3.2, netGexDir: "POSITIVE",
  flip: 5735, flipDist: -16.6, flipDistPct: -0.29,
  callWall: 5750, putWall: 5680, kingNode: 5725,
  regime: "POSITIVE GAMMA",
  regimeSub: "Dealers are net long gamma — they buy dips and sell rips, suppressing volatility. Favor mean-reversion and premium selling strategies.",
  charmFlow: "+$420M",
  totalFlow: "$4.8B",

  gexStrikes: [
    { strike: 5750, gex: 2.8,  side: "pos", tag: "CALL WALL" },
    { strike: 5725, gex: 4.1,  side: "pos", tag: "👑 KING" },
    { strike: 5720, gex: 1.2,  side: "pos", tag: null },
    { strike: 5735, gex: -0.4, side: "neg", tag: "FLIP" },
    { strike: 5680, gex: -2.9, side: "neg", tag: "PUT WALL" },
  ],

  signals: [
    { ticker:"SPX",  direction:"BULL",    headline:"King Node pin — fade breakdowns",   conf:74, tf:"0DTE"  },
    { ticker:"NVDA", direction:"BULL",    headline:"$890K call sweep, informed flow",   conf:81, tf:"0DTE"  },
    { ticker:"SPY",  direction:"BEAR",    headline:"Put block — hedge above flip",      conf:68, tf:"SWING" },
  ],

  flow: [
    { time:"14:03", ticker:"SPY",  type:"SWEEP", side:"CALL", prem:"$2.1M", exp:"0DTE",  unusual:true  },
    { time:"13:58", ticker:"QQQ",  type:"BLOCK", side:"PUT",  prem:"$1.8M", exp:"1W",    unusual:true  },
    { time:"13:51", ticker:"NVDA", type:"SWEEP", side:"CALL", prem:"$890K", exp:"0DTE",  unusual:true  },
    { time:"13:44", ticker:"AAPL", type:"BLOCK", side:"CALL", prem:"$440K", exp:"2W",    unusual:false },
  ],

  darkPool: [
    { ticker:"SPY",  size:"4.2M", price:"$571.40", notional:"$2.4B", dir:"BELOW ASK" },
    { ticker:"AAPL", size:"1.8M", price:"$228.60", notional:"$411M", dir:"AT BID"    },
  ],
};

// ── HELPERS ─────────────────────────────────────────────────
const fmt = (n, dec=2) => n >= 0 ? `+${n.toFixed(dec)}` : n.toFixed(dec);
const maxGex = Math.max(...DATA.gexStrikes.map(s=>Math.abs(s.gex)));

// ── SUB-COMPONENTS ───────────────────────────────────────────

function Panel({title,action,children,style={}}){
  return <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,overflow:"hidden",...style}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 12px",borderBottom:`1px solid ${C.border}`}}>
      <span style={{fontSize:7,fontWeight:600,letterSpacing:".14em",color:C.muted}}>{title}</span>
      {action&&<span style={{fontSize:7,color:C.accent,letterSpacing:".08em",cursor:"pointer"}}>{action}</span>}
    </div>
    <div style={{padding:"10px 12px"}}>{children}</div>
  </div>;
}

function StatBox({label,value,sub,color=C.text,small=false}){
  return <div style={{background:C.raised,border:`1px solid ${C.border}`,borderRadius:5,padding:"8px 10px",display:"flex",flexDirection:"column",gap:3}}>
    <span style={{fontSize:7,fontWeight:600,letterSpacing:".12em",color:C.muted}}>{label}</span>
    <span style={{fontSize:small?14:16,fontWeight:600,color,letterSpacing:"-.01em",lineHeight:1}}>{value}</span>
    {sub&&<span style={{fontSize:8,color:C.muted2}}>{sub}</span>}
  </div>;
}

function RegimeBanner(){
  const isPos = DATA.regime==="POSITIVE GAMMA";
  const rc = isPos ? C.accent : C.red;
  return <div style={{background:`${rc}0c`,border:`1px solid ${rc}25`,borderRadius:6,padding:"10px 14px",display:"flex",gap:12,alignItems:"flex-start",position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${rc},transparent)`,animation:"shimmer 3s infinite"}}/>
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,flexShrink:0,paddingTop:2}}>
      <div style={{width:10,height:10,borderRadius:"50%",background:rc,boxShadow:`0 0 12px ${rc}`,animation:"pulse 2s infinite"}}/>
      <span style={{fontSize:6,fontWeight:700,letterSpacing:".12em",color:rc,writingMode:"horizontal-tb"}}>REGIME</span>
    </div>
    <div style={{flex:1,minWidth:0}}>
      <div style={{fontSize:13,fontWeight:600,color:rc,letterSpacing:".04em",marginBottom:4}}>{DATA.regime}</div>
      <div style={{fontSize:8,color:C.muted2,lineHeight:1.6}}>{DATA.regimeSub}</div>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:4,flexShrink:0,alignItems:"flex-end"}}>
      <div style={{fontSize:7,color:C.muted}}>FLIP DIST</div>
      <div style={{fontSize:12,fontWeight:600,color:C.gold}}>{DATA.flipDistPct}%</div>
      <div style={{fontSize:8,color:C.muted2}}>${Math.abs(DATA.flipDist).toFixed(0)}pts</div>
    </div>
  </div>;
}

function GexStrip(){
  return <div style={{display:"flex",flexDirection:"column",gap:4}}>
    {DATA.gexStrikes.map((s,i)=>{
      const pct=Math.abs(s.gex)/maxGex*100;
      const color=s.side==="pos"?C.accent:C.red;
      const isKing=s.tag&&s.tag.includes("👑");
      const isFlip=s.tag==="FLIP";
      return <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"3px 0",borderLeft:isFlip?`2px solid ${C.gold}`:"2px solid transparent",paddingLeft:isFlip?6:8}}>
        <span style={{fontSize:8,fontWeight:600,color:isKing?C.gold:isFlip?C.gold:C.muted2,minWidth:40}}>${s.strike}</span>
        <div style={{flex:1,height:6,background:C.raised,borderRadius:2,overflow:"hidden"}}>
          <div style={{width:`${pct}%`,height:"100%",background:isKing?C.gold:color,borderRadius:2,transition:"width .5s ease"}}/>
        </div>
        <span style={{fontSize:7,color:color,fontWeight:600,minWidth:28,textAlign:"right"}}>{s.gex>0?"+":""}{s.gex}B</span>
        {s.tag&&<span style={{fontSize:6,fontWeight:700,letterSpacing:".08em",color:isKing?C.gold:isFlip?C.gold:color,background:`${isKing?C.gold:isFlip?C.gold:color}18`,border:`1px solid ${isKing?C.gold:isFlip?C.gold:color}40`,borderRadius:2,padding:"1px 5px",minWidth:52,textAlign:"center"}}>{s.tag}</span>}
      </div>;
    })}
  </div>;
}

function SignalRow({s}){
  const dc=s.direction==="BULL"?C.accent:s.direction==="BEAR"?C.red:C.gold;
  return <div style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:`1px solid ${C.border}`}}>
    <span style={{fontSize:11,fontWeight:600,color:C.text,minWidth:40}}>{s.ticker}</span>
    <div style={{padding:"1px 6px",borderRadius:2,fontSize:7,fontWeight:700,background:`${dc}18`,color:dc,border:`1px solid ${dc}35`,flexShrink:0}}>
      {s.direction==="BULL"?"↑":s.direction==="BEAR"?"↓":"→"} {s.direction}
    </div>
    <span style={{flex:1,fontSize:8,color:C.muted2,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.headline}</span>
    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2,flexShrink:0}}>
      <div style={{width:32,height:3,background:C.raised,borderRadius:1,overflow:"hidden"}}>
        <div style={{width:`${s.conf}%`,height:"100%",background:s.conf>=75?C.accent:C.gold}}/>
      </div>
      <span style={{fontSize:6,color:C.muted}}>{s.tf}</span>
    </div>
  </div>;
}

function FlowRow({f}){
  const sc=f.side==="CALL"?C.accent:C.red;
  return <div style={{display:"flex",alignItems:"center",gap:7,padding:"4px 0",borderBottom:`1px solid ${C.border}`}}>
    <span style={{fontSize:8,color:C.muted,minWidth:34,flexShrink:0}}>{f.time}</span>
    <span style={{fontSize:10,fontWeight:600,color:C.text,minWidth:36}}>{f.ticker}</span>
    <span style={{fontSize:7,fontWeight:600,color:f.type==="SWEEP"?C.orange:C.blue,background:f.type==="SWEEP"?`${C.orange}15`:`${C.blue}15`,border:`1px solid ${f.type==="SWEEP"?C.orange:C.blue}35`,borderRadius:2,padding:"1px 5px",flexShrink:0}}>{f.type}</span>
    <span style={{fontSize:8,fontWeight:600,color:sc,minWidth:28}}>{f.side}</span>
    <span style={{flex:1,fontSize:9,fontWeight:600,color:C.text,textAlign:"right"}}>{f.prem}</span>
    {f.unusual&&<div style={{width:5,height:5,borderRadius:"50%",background:C.gold,boxShadow:`0 0 4px ${C.gold}`,flexShrink:0,animation:"pulse 2s infinite"}}/>}
  </div>;
}

// ── MAIN ────────────────────────────────────────────────────
export default function DarkflowOverview(){
  const[clock,setClock]=useState("");
  const[activeTab,setActiveTab]=useState("OVERVIEW");
  useEffect(()=>{const t=setInterval(()=>setClock(new Date().toLocaleTimeString("en-US",{hour12:false})),1000);return()=>clearInterval(t);},[]);

  return <div style={{display:"flex",flexDirection:"column",height:"100vh",background:C.bg,fontFamily:"IBM Plex Mono,monospace",overflow:"hidden"}}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@600&display=swap');
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
      @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
      *{box-sizing:border-box;margin:0;padding:0}
      ::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:#252540}
    `}</style>

    {/* TOP NAV */}
    <div style={{flexShrink:0,height:44,background:C.surface,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",padding:"0 16px",gap:16}}>
      <div style={{fontFamily:"IBM Plex Sans",fontWeight:600,fontSize:13,letterSpacing:".12em",color:C.accent,display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:0,height:0,borderLeft:"8px solid transparent",borderRight:"8px solid transparent",borderBottom:`14px solid ${C.accent}`}}/>DARKFLOW
      </div>
      <div style={{display:"flex",height:"100%",overflowX:"auto",gap:0}}>
        {["OVERVIEW","FLOW","GEX","NET DRIFT","DARK POOL","CHAIN","JOURNAL","AI SIGNALS"].map(t=>
          <div key={t} onClick={()=>setActiveTab(t)} style={{height:"100%",padding:"0 12px",display:"flex",alignItems:"center",fontSize:10,fontWeight:500,letterSpacing:".08em",whiteSpace:"nowrap",color:activeTab===t?C.accent:C.muted,borderBottom:activeTab===t?`2px solid ${C.accent}`:"2px solid transparent",cursor:"pointer"}}>{t}</div>
        )}
      </div>
      <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:C.accent,boxShadow:`0 0 6px ${C.accent}`,animation:"pulse 2s infinite"}}/>
        <span style={{fontSize:10,color:C.muted2}}>{clock}</span>
      </div>
    </div>

    {/* MARKET TICKER STRIP */}
    <div style={{flexShrink:0,height:28,background:"#09090f",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:0,overflowX:"auto",padding:"0 16px"}}>
      {[
        {label:"SPX", val:`$${DATA.spx.toLocaleString()}`, chg:`${fmt(DATA.spxChg,2)}%`, up:DATA.spxChg>=0},
        {label:"VIX", val:`${DATA.vix}`, chg:`${fmt(DATA.vixChg,1)}`, up:DATA.vixChg<0},
        {label:"NET GEX", val:`+$${DATA.netGex}B`, chg:"POSITIVE", up:true},
        {label:"FLIP", val:`$${DATA.flip}`, chg:`${fmt(DATA.flipDistPct,2)}%`, up:false},
        {label:"CALL WALL", val:`$${DATA.callWall}`, chg:"RESISTANCE", up:true},
        {label:"PUT WALL", val:`$${DATA.putWall}`, chg:"SUPPORT", up:false},
      ].map((item,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,flexShrink:0,marginRight:20}}>
        <span style={{fontSize:8,color:C.muted,letterSpacing:".08em"}}>{item.label}</span>
        <span style={{fontSize:9,fontWeight:600,color:C.text}}>{item.val}</span>
        <span style={{fontSize:8,color:item.up?C.accent:C.red}}>{item.chg}</span>
      </div>)}
    </div>

    {/* BODY */}
    <div style={{flex:1,overflowY:"auto",padding:"10px 12px",display:"flex",flexDirection:"column",gap:8,WebkitOverflowScrolling:"touch"}}>

      {/* REGIME BANNER */}
      <div style={{animation:"fadeUp .3s ease both"}}><RegimeBanner/></div>

      {/* STAT GRID */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,animation:"fadeUp .3s ease .05s both"}}>
        <StatBox label="SPX" value={`$${DATA.spx.toLocaleString()}`} sub={`${fmt(DATA.spxChg,2)}%  ${fmt(DATA.spxChgPts,1)}pts`} color={DATA.spxChg>=0?C.accent:C.red}/>
        <StatBox label="VIX" value={DATA.vix} sub={`${fmt(DATA.vixChg,1)} today`} color={DATA.vix>20?C.red:DATA.vix>16?C.gold:C.accent}/>
        <StatBox label="NET GEX" value={`+$${DATA.netGex}B`} sub="Dealer net long gamma" color={C.accent}/>
        <StatBox label="TOTAL FLOW" value={DATA.totalFlow} sub={`Charm: ${DATA.charmFlow}`} color={C.blue}/>
      </div>

      {/* GEX STRIP + AI SIGNALS side by side on wider screens, stacked on mobile */}
      <div style={{display:"grid",gridTemplateColumns:"1fr",gap:8,animation:"fadeUp .3s ease .1s both"}}>
        <Panel title="GEX KEY LEVELS" action="FULL HEATMAP →">
          <GexStrip/>
        </Panel>
      </div>

      {/* AI SIGNALS */}
      <div style={{animation:"fadeUp .3s ease .15s both"}}>
        <Panel title="AI SIGNALS — TOP SETUPS" action="ALL SIGNALS →">
          <div style={{display:"flex",flexDirection:"column"}}>
            {DATA.signals.map((s,i)=><SignalRow key={i} s={s}/>)}
          </div>
        </Panel>
      </div>

      {/* FLOW + DARK POOL */}
      <div style={{animation:"fadeUp .3s ease .2s both"}}>
        <Panel title="OPTIONS FLOW — UNUSUAL ACTIVITY" action="FULL FEED →">
          <div style={{display:"flex",flexDirection:"column"}}>
            {DATA.flow.map((f,i)=><FlowRow key={i} f={f}/>)}
          </div>
        </Panel>
      </div>

      <div style={{animation:"fadeUp .3s ease .25s both"}}>
        <Panel title="DARK POOL — LARGE PRINTS">
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {DATA.darkPool.map((d,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",background:C.raised,border:`1px solid ${C.border}`,borderRadius:4}}>
                <span style={{fontSize:12,fontWeight:600,color:C.text,minWidth:44}}>{d.ticker}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:9,fontWeight:600,color:C.blue}}>{d.size} shares @ {d.price}</div>
                  <div style={{fontSize:7,color:C.muted2,marginTop:2}}>{d.notional} notional · {d.dir}</div>
                </div>
                <div style={{width:6,height:6,borderRadius:"50%",background:C.blue,boxShadow:`0 0 5px ${C.blue}`,flexShrink:0}}/>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* BOTTOM PADDING */}
      <div style={{height:8}}/>
    </div>
  </div>;
}
