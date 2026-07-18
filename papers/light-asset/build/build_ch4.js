const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
const B = "0056A0", D = "1A1A2E", R = "C0392B", G = "555555";
const LG = "F2F4F7", W = "FFFFFF", DG = "888899", TEAL = "00796B";

function T(s,x,y,w,h,text,sz,cl,b,ff,al,lsp) {
  sz=sz||10;cl=cl||D;b=b||false;ff=ff||"Arial";al=al||"left";lsp=lsp||1.15;
  s.addText(text,{x,y,w,h,fontSize:sz,color:cl,bold:b,fontFace:ff,align:al,margin:0,lineSpacingMultiple:lsp});
}
function C(s,x,y,w,h,fill) {
  fill=fill||W;
  s.addShape(pres.shapes.RECTANGLE,{x,y,w,h,fill:{color:fill},shadow:{type:"outer",blur:3,offset:1,color:"000000",opacity:0.08}});
}

// ===== S1: COVER =====
(function(){
  const s=pres.addSlide(); s.background={color:D};
  s.addShape(pres.shapes.RECTANGLE,{x:0.7,y:1.3,w:0.05,h:2.8,fill:{color:B}});
  T(s,1.0,1.4,8.5,0.45,"写作体例与论文大纲",12,B,true);
  T(s,1.0,1.85,8.5,1.0,"写作体例 \u00b7 章节结构 \u00b7 进度安排",34,W,true,"Arial Black");
})();

// ===== S2: OUTLINE =====
(function(){
  const s=pres.addSlide(); s.background={color:W};
  s.addShape(pres.shapes.RECTANGLE,{x:0,y:0,w:10,h:0.04,fill:{color:B}});
  T(s,0.6,0.2,8.8,0.4,"论文大纲",22,D,true,"Arial Black");

  C(s,0.5,0.72,1.8,0.35,B);
  T(s,0.6,0.76,1.6,0.25,"写作体例：案例分析",9,W,true,"Arial","center");

  const chapters=[
    {n:"一",title:"绪论",sub:"研究背景 / 研究意义 / 研究内容与方法 / 研究框架与创新点",cl:B},
    {n:"二",title:"理论基础与文献综述",sub:"轻资产运营理论 / REITs金融功能 / 战略转型视角 / 文献综述与评述 / 战略管理分析工具",cl:TEAL},
    {n:"三",title:"研究设计",sub:"研究问题与假设 / 案例选择 / 分析框架构建 / 数据来源与收集",cl:"E67E22"},
    {n:"四",title:"华润案例深度分析",sub:"转型历程 / 万象生活商管平台 / 华润商业REIT发行 / 财务效应 / 运营效应",cl:R},
    {n:"五",title:"凯德案例验证分析",sub:"REITs版图 / 资本闭环模式 / 财务效应 / 跨案例比较",cl:"8B5CF6"},
    {n:"六",title:"研究结论与建议",sub:"主要研究发现 / 理论贡献 / 实践启示 / 研究局限与展望",cl:"0891B2"},
  ];

  chapters.forEach(function(ch,i){
    const y=1.2+i*0.7;
    C(s,0.5,y,9.0,0.6,LG);
    s.addShape(pres.shapes.OVAL,{x:0.6,y:y+0.1,w:0.4,h:0.4,fill:{color:ch.cl}});
    T(s,0.6,y+0.14,0.4,0.3,ch.n,12,W,true,"Arial Black","center");
    T(s,1.15,y+0.05,2.8,0.25,"第"+ch.n+"章",8,DG);
    T(s,1.15,y+0.25,2.8,0.25,ch.title,12,D,true);
    T(s,4.0,y+0.08,5.2,0.4,ch.sub,8,G);
  });

  T(s,0.6,5.35,8.8,0.15,"六章结构，\u201C绪论\u2192理论\u2192设计\u2192主案例\u2192验证案例\u2192结论\u201D逻辑递进",8,DG);
})();

// ===== S3: TIMELINE =====
(function(){
  const s=pres.addSlide(); s.background={color:W};
  s.addShape(pres.shapes.RECTANGLE,{x:0,y:0,w:10,h:0.04,fill:{color:B}});
  T(s,0.6,0.2,8.8,0.4,"进度安排",22,D,true,"Arial Black");

  s.addShape(pres.shapes.LINE,{x:0.8,y:3.0,w:8.4,h:0,line:{color:B,width:2}});

  const phases=[
    {start:"2026.05",end:"2026.07",label:"文献调研与\n理论框架构建",dot:B},
    {start:"2026.08",end:"2026.09",label:"案例资料\n收集与整理",dot:TEAL},
    {start:"2026.10",end:"2026.11",label:"华润案例\n深度分析",dot:"E67E22"},
    {start:"2026.11",end:"2026.12",label:"凯德案例\n验证分析",dot:R},
    {start:"2027.01",end:"2027.02",label:"论文初稿\n撰写",dot:"8B5CF6"},
    {start:"2027.02",end:"2027.03",label:"论文修改\n完善",dot:"0891B2"},
    {start:"2027.03",end:"2027.04",label:"定稿与\n提交",dot:D},
  ];

  phases.forEach(function(p,i){
    const x=0.9+i*1.25;
    s.addShape(pres.shapes.OVAL,{x:x+0.2,y:2.86,w:0.28,h:0.28,fill:{color:p.dot}});
    T(s,x-0.15,2.2,1.0,0.2,p.start+"\u2192"+p.end,7,p.dot,true,"Arial","center");
    T(s,x-0.15,3.25,1.0,0.7,p.label,9,D,true,"Arial","center");
  });

  C(s,0.5,4.2,9.0,0.55,D);
  T(s,0.7,4.3,8.6,0.35,"总周期：2026年5月\u20142027年4月，共12个月。文献\u2192资料\u2192案例\u2192初稿\u2192修改\u2192定稿，六阶段推进。",9,W);
})();

// ===== S4: CONCLUSION =====
(function(){
  const s=pres.addSlide(); s.background={color:W};
  s.addShape(pres.shapes.RECTANGLE,{x:0,y:0,w:10,h:0.04,fill:{color:B}});
  T(s,0.6,0.2,8.8,0.45,"总 结",28,D,true,"Arial Black");

  // Core thesis statement
  C(s,0.5,0.8,9.0,1.1,D);
  T(s,0.7,0.9,8.6,0.8,[
    {text:"本研究以REITs为切入点，以华润置地/万象生活（主案例）、凯德集团（验证案例）和苏宁易购（反面案例）为研究对象，\n",options:{fontSize:10,color:"BBCCDD",breakLine:true}},
    {text:"系统回答\u201CREITs如何驱动商业地产企业实现轻资产转型\u201D这一核心问题。",options:{fontSize:11,color:W,bold:true}},
  ],{margin:0});

  // Four pillars summary
  const pillars=[
    {cl:B,t:"选题逻辑",body:"PEST分析揭示四重驱动力\u2192行业数据呈现结构性危机\u2192REITs政策打开转型窗口\u2192三个研究问题指向核心命题"},
    {cl:TEAL,t:"理论基础",body:"三大理论支柱（RBV/核心能力/商业模式）\u2192两个战略视角（动态能力/八步变革）\u2192八项分析工具\u2192三个文献缺口\u2192明确定位"},
    {cl:"E67E22",t:"研究方案",body:"五个子问题+五个假设\u2192三案例正反验证设计\u2192三层框架+五阶段路径+五维度穿透+假设检验框架\u2192公开数据+四种方法"},
    {cl:R,t:"论文大纲",body:"六章结构\u2014\u2014绪论\u2192理论\u2192设计\u2192华润分析\u2192凯德验证\u2192结论\u2014\u2014逻辑递进，12个月完成"},
  ];

  pillars.forEach(function(p,i){
    const y=2.05+i*0.85;
    C(s,0.5,y,9.0,0.75,LG);
    s.addShape(pres.shapes.RECTANGLE,{x:0.5,y,w:0.04,h:0.75,fill:{color:p.cl}});
    T(s,0.7,y+0.08,1.2,0.25,p.t,11,p.cl,true,"Arial Black");
    T(s,2.0,y+0.08,7.2,0.55,p.body,9,G);
  });

  // Expected contributions
  C(s,0.5,5.35,9.0,0.25,D);
  T(s,0.7,5.37,8.6,0.2,"预期贡献：为REITs驱动的轻资产转型提供首个\u201C交易结构-出表效果-转型效应\u201D全链条分析框架，为行业提供可复制的转型路径参考。",8,"8899BB");
})();

pres.writeFile({fileName:"/Users/op/WorkBuddy/论文优化/写作体例与大纲.pptx"})
  .then(function(){console.log("Done:4 slides");}).catch(function(err){console.error(err);});
