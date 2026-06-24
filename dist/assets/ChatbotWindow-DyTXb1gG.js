import{b as c,r as i,u as K,j as e,m as b,X as L,A as V}from"./index-szjIIlQ4.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W=c("Maximize2",[["polyline",{points:"15 3 21 3 21 9",key:"mznyad"}],["polyline",{points:"9 21 3 21 3 15",key:"1avn1i"}],["line",{x1:"21",x2:"14",y1:"3",y2:"10",key:"ota7mn"}],["line",{x1:"3",x2:"10",y1:"21",y2:"14",key:"1atl0r"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=c("Minimize2",[["polyline",{points:"4 14 10 14 10 20",key:"11kfnr"}],["polyline",{points:"20 10 14 10 14 4",key:"rlmsce"}],["line",{x1:"14",x2:"21",y1:"10",y2:"3",key:"o5lafz"}],["line",{x1:"3",x2:"10",y1:"21",y2:"14",key:"1atl0r"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const O=c("Send",[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]);function T({messages:x,onSendMessage:g,onClose:f,isLoading:o,position:w="bottom-right",theme:u="auto",language:j="es"}){const[r,h]=i.useState(""),[a,v]=i.useState(!1),[s,N]=i.useState(!1),[k,z]=i.useState(!1),p=i.useRef(null),d=i.useRef(null),{resetUnread:$}=K(),E={"bottom-right":"bottom-16 right-2 sm:bottom-20 sm:right-4","bottom-left":"bottom-16 left-2 sm:bottom-20 sm:left-4"},n=u==="dark"||u==="auto"&&document.documentElement.classList.contains("dark");i.useEffect(()=>{const t=()=>{N(window.innerWidth<768)};t(),window.addEventListener("resize",t);const l=()=>{if(s){const I=window.innerHeight<window.screen.height*.8;z(I)}};return window.addEventListener("resize",l),()=>{window.removeEventListener("resize",t),window.removeEventListener("resize",l)}},[s]),i.useEffect(()=>{var t;(t=p.current)==null||t.scrollIntoView({behavior:"smooth"})},[x]),i.useEffect(()=>{$()},[]),i.useEffect(()=>{!a&&d.current&&setTimeout(()=>{var t;return(t=d.current)==null?void 0:t.focus()},100)},[a]);const y=()=>{r.trim()&&!o&&(g(r),h(""))},M=t=>{t.key==="Enter"&&!t.shiftKey&&(t.preventDefault(),y())},S=()=>{const t={es:"Escribe...",en:"Type...",gr:"Γράψτε..."};return t[j]||t.es},m=s?k?320:380:520,C=s?290:400,H=s?40:52,D=s?44:56,R=m-H-D;return e.jsxs(b.div,{initial:{opacity:0,y:20,scale:.95},animate:{opacity:1,y:0,scale:1,height:a?"auto":m,width:a?"auto":C},exit:{opacity:0,y:20,scale:.95},className:`
        fixed ${E[w]} z-50
        w-[85vw] max-w-[400px]
        rounded-xl sm:rounded-2xl
        shadow-2xl
        overflow-hidden
        ${n?"bg-gray-900 border border-gray-700":"bg-white border border-gray-200"}
        transition-all duration-300
      `,children:[e.jsxs("div",{className:`
        px-2.5 py-2 flex justify-between items-center
        ${n?"bg-gradient-to-r from-blue-600 to-purple-600":"bg-gradient-to-r from-blue-500 to-purple-500"}
        min-h-[40px] sm:min-h-[52px]
      `,children:[e.jsxs("div",{className:"flex items-center gap-1.5 text-white min-w-0",children:[e.jsx("span",{className:`${s?"text-base":"text-xl"} flex-shrink-0`,children:"🐶"}),e.jsxs("div",{className:"truncate",children:[e.jsx("h3",{className:`font-bold ${s?"text-[10px]":"text-sm"} truncate`,children:s?"ESH":"Electric Scooter House"}),e.jsx("span",{className:`${s?"text-[6px]":"text-[10px]"} opacity-80`,children:"● Online"})]})]}),e.jsxs("div",{className:"flex gap-0.5 flex-shrink-0",children:[e.jsx("button",{onClick:()=>v(!a),className:"text-white hover:bg-white/20 rounded-lg p-1 transition",children:a?e.jsx(W,{size:s?12:18}):e.jsx(A,{size:s?12:18})}),e.jsx("button",{onClick:f,className:"text-white hover:bg-white/20 rounded-lg p-1 transition",children:e.jsx(L,{size:s?12:18})})]})]}),e.jsx(V,{children:!a&&e.jsxs(b.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},className:"flex flex-col",style:{height:R},children:[e.jsxs("div",{className:`
              flex-1 overflow-y-auto p-2 space-y-1.5
              ${n?"bg-gray-800":"bg-gray-50"}
            `,children:[x.map((t,l)=>e.jsx("div",{className:`flex ${t.role==="user"?"justify-end":"justify-start"}`,children:e.jsx("div",{className:`
                      max-w-[90%] px-2 py-1 rounded-xl
                      ${t.role==="user"?`${n?"bg-blue-600":"bg-blue-500"} text-white rounded-br-none`:`${n?"bg-gray-700 text-white":"bg-white text-gray-800"} rounded-bl-none shadow-sm`}
                    `,children:e.jsx("p",{className:`whitespace-pre-wrap break-words ${s?"text-[11px]":"text-[13px]"} leading-relaxed`,children:t.content})})},l)),o&&e.jsx("div",{className:"flex justify-start",children:e.jsxs("div",{className:`
                    p-1.5 rounded-xl rounded-bl-none shadow-sm flex gap-0.5
                    ${n?"bg-gray-700":"bg-white"}
                  `,children:[e.jsx("span",{className:"w-1 h-1 bg-gray-400 rounded-full animate-bounce"}),e.jsx("span",{className:"w-1 h-1 bg-gray-400 rounded-full animate-bounce",style:{animationDelay:"0.2s"}}),e.jsx("span",{className:"w-1 h-1 bg-gray-400 rounded-full animate-bounce",style:{animationDelay:"0.4s"}})]})}),e.jsx("div",{ref:p})]}),e.jsx("div",{className:`
              p-1.5 border-t
              ${n?"border-gray-700 bg-gray-900":"border-gray-200 bg-white"}
            `,children:e.jsxs("div",{className:"flex gap-1",children:[e.jsx("input",{ref:d,type:"text",value:r,onChange:t=>h(t.target.value),onKeyDown:M,placeholder:S(),disabled:o,className:`
                    flex-1 rounded-lg px-2.5 py-1
                    focus:outline-none focus:ring-1 focus:ring-blue-500
                    ${n?"bg-gray-700 text-white placeholder-gray-400":"bg-gray-100 text-gray-800 placeholder-gray-500"}
                    ${s?"text-[11px] py-1 px-2":"text-sm py-2 px-3.5"}
                  `}),e.jsx("button",{onClick:y,disabled:o||!r.trim(),className:`
                    rounded-lg transition disabled:opacity-50
                    ${n?"bg-blue-600 hover:bg-blue-700 text-white":"bg-blue-500 hover:bg-blue-600 text-white"}
                    ${s?"px-2.5 py-1":"px-4 py-2"}
                  `,children:e.jsx(O,{size:s?12:18})})]})})]})})]})}export{T as default};
