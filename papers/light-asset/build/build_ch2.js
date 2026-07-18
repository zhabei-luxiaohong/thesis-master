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
  T(s,1.0,1.4,8.5,0.45,"第二章",12,B,true); T(s,1.0,1.85,8.5,1.0,"理论基础与文献综述",34,W,true,"Arial Black");
  T(s,1.0,3.0,8.5,0.7,"战略管理理论 \u2192 现有文献与定位 \u2192 本章小结",12,DG);
})();

// ===== S2: THEORY + TOOLS =====
(function(){
  const s=pres.addSlide(); s.background={color:W};
  s.addShape(pres.shapes.RECTANGLE,{x:0,y:0,w:10,h:0.04,fill:{color:B}});
  T(s,0.6,0.2,4,0.45,"理论基础与分析工具",22,D,true,"Arial Black");
  T(s,4.8,0.25,5,0.35,"（2.1 理论基础 / 2.4 战略管理分析工具）",9,DG);

  // LEFT: Five theories in sequence
  const theories = [
    {cl:B,n:"RBV",author:"Barney 1986",body:"异质性资源\u2192竞争优势。\u201C聚焦核心能力、剥离非核心资产\u201D，为轻资产运营提供战略逻辑。"},
    {cl:TEAL,n:"核心能力",author:"Prahalad & Hamel 1990",body:"\u201C组织中的集体学习\u201D。企业应围绕核心能力而非纵向一体化构建优势。"},
    {cl:"E67E22",n:"商业模式",author:"Osterwalder & Pigneur 2010",body:"九大要素重新配置：核心资源从有形资产\u2192无形资产，业务从持有\u2192管理输出。"},
    {cl:R,n:"动态能力",author:"Teece 2009",body:"感知\u2192捕捉\u2192重构。适用于分析REITs驱动资源重构的转型机制。"},
    {cl:"8B5CF6",n:"八步变革",author:"Kotter 1996",body:"转型阶段性推进的过程框架，揭示华润/凯德多年转型的关键步骤。"},
  ];
  theories.forEach(function(th,i){
    const y=0.75+i*0.55;
    s.addShape(pres.shapes.RECTANGLE,{x:0.5,y,w:0.45,h:0.48,fill:{color:th.cl}});
    T(s,0.5,y+0.08,0.45,0.28,th.n,8,W,true,"Arial Black","center");
    T(s,1.1,y+0.02,1.6,0.22,th.author,7,th.cl,true);
    T(s,1.1,y+0.22,4.0,0.22,th.body,8,G);
  });

  // RIGHT: Eight tools
  C(s,5.8,0.75,3.8,2.8,LG);
  T(s,6.0,0.82,3.4,0.25,"八项战略管理分析工具",10,B,true);
  const tools=[
    {n:"PEST",use:"第一章行业背景"},{n:"波特五力",use:"华润/凯德竞争分析"},
    {n:"SWOT",use:"华润与凯德交叉评估"},{n:"IFE/EFE",use:"苏宁内外部审视"},
    {n:"BCG矩阵",use:"华润三类业务比较"},{n:"SPACE矩阵",use:"凯德战略评估"},
    {n:"QSPM",use:"双路径比较"},{n:"财务比率分析",use:"五维度穿透框架"},
  ];
  tools.forEach(function(t,i){
    const y=1.15+i*0.29;
    T(s,6.0,y,1.3,0.22,t.n,9,D,true); T(s,7.3,y,2.1,0.22,t.use,8,G);
  });

  // BOTTOM: usage logic
  C(s,0.5,3.3,9.0,1.9,D);
  T(s,0.7,3.4,8.6,0.25,"理论 \u2192 工具 \u2192 论文各章的嵌入逻辑",11,W,true);
  T(s,0.7,3.75,8.6,1.3,[
    {text:"理论基础提供\u201C怎么看\u201D的视角：RBV/核心能力/商业模式三者递进\u2014\u2014RBV解释为何剥离重资产，核心能力回答凭什么转向轻资产，商业模式指导如何系统评估转型效果。动态能力揭示REITs驱动资源重构的机制，Kotter模型刻画转型的阶段性推进。\n\n",options:{fontSize:9,color:"BBCCDD",breakLine:true}},
    {text:"分析工具提供\u201C怎么分析\u201D的方法\u2014\u2014PEST用于第一章环境扫描，五力/SWOT/SPACE嵌入案例竞争分析，BCG用于华润业务组合诊断，IFE/EFE用于苏宁失败归因，QSPM用于路径比较，财务比率分析构成五维度框架核心。各工具散布于后续章节，与理论视角形成配套。",options:{fontSize:9,color:"99AABB"}},
  ],{margin:0});
})();

// ===== S3: LITERATURE + GAPS + POSITIONING =====
(function(){
  const s=pres.addSlide(); s.background={color:W};
  s.addShape(pres.shapes.RECTANGLE,{x:0,y:0,w:10,h:0.04,fill:{color:B}});
  T(s,0.6,0.15,4,0.45,"现有文献与本研究定位",22,D,true,"Arial Black");
  T(s,4.8,0.2,5,0.35,"（2.2 文献综述 / 2.3 文献评述）",9,DG);

  // Three columns: existing findings
  const domains=[
    {cl:B,title:"轻资产运营",key:"Furrer(2004)/吴晓波&陈小洪(2022)/Sohn等(2013)/Turner&Guilding(2010)",
      found:"轻资产企业ROE高出3-5pp，盈利波动性更低，但过度轻资产化引发控制力减弱和委托代理问题，效率高度依赖管理体系成熟度。核心命题：转型需在\u201C轻\u201D与\u201C控\u201D之间寻求平衡。"},
    {cl:TEAL,title:"REITs研究",key:"Hardin&Wu(2010)/Boudry等(2012)/王宇&马明(2022)/原野&彭晓敏(2019)/刘月龙(2023)",
      found:"国外：REITs使开发占比\u219312pp、负债率\u21938-15pp、信息质量\u2191。国内：验证去杠杆效应，也发现\u201C出表不降杠杆\u201D现象，识别出\u201C真实出售\u201D与\u201C售后租回\u201D的本质差异及并表判断模糊地带。"},
    {cl:R,title:"商业地产转型",key:"张红&陈骁(2022)/陈启宗&刘志强(2023)/杨奕&郭杰群(2024)/沈奇(2020)",
      found:"万达商管独立、越秀REITs负债率84%\u219259%、凯德\u201C私募基金+REITs\u201D闭环均有案例积累。但多聚焦单一企业描述，缺少正反案例对比和多维度量化评估。"},
  ];
  domains.forEach(function(d,i){
    const x=0.35+i*3.15;
    C(s,x,0.6,3.0,1.85,W); s.addShape(pres.shapes.RECTANGLE,{x,y:0.6,w:3.0,h:0.05,fill:{color:d.cl}});
    T(s,x+0.1,0.72,2.8,0.22,d.title,11,D,true); T(s,x+0.1,0.95,2.8,0.35,d.key,7,d.cl);
    s.addShape(pres.shapes.RECTANGLE,{x:x+0.1,y:1.32,w:2.8,h:0.01,fill:{color:d.cl}});
    T(s,x+0.1,1.4,2.8,0.95,d.found,8,G);
  });

  // Gaps + Positioning
  C(s,0.5,2.6,9.0,2.7,W);
  T(s,0.7,2.68,8.6,0.25,"研究不足",11,R,true);
  T(s,0.7,3.0,8.6,0.8,[
    {text:"\u2460 交易结构与财务效应关系未充分揭示\u2014\u2014Hardin/Wu、原野/彭晓敏、王宇/马明、刘月龙等发现分散在金融学、会计学、公司财务不同领域，未整合为\u201C交易结构-出表效果-转型效应\u201D统一框架。\n",options:{fontSize:9,color:G,breakLine:true}},
    {text:"\u2461 转型评估停留在单一指标\u2014\u2014Sohn聚焦ROE、Hardin关注负债率、吴晓波侧重盈利波动，缺少多维度系统评估。\n",options:{fontSize:9,color:G,breakLine:true}},
    {text:"\u2462 中国情境案例研究三不足：缺正反对比、华润\u201C双平台\u201D文献空白、跨国比较不充分。",options:{fontSize:9,color:G}},
  ],{margin:0});

  // Positioning bar
  s.addShape(pres.shapes.RECTANGLE,{x:0.7,y:3.9,w:8.6,h:0.02,fill:{color:B}});
  T(s,0.7,4.0,8.6,0.5,"\u2192 本文定位：以战略管理视角统领三领域，构建\u201C交易结构-出表效果-转型效应\u201D全链条框架，五维度穿透评估，华润+凯德+苏宁三案例正反验证。",10,B,true);

  // Three positioning cards at bottom
  const pos=[
    {cl:B,t:"视角",d:"战略管理视角\u2192整合\n三个碎片化领域"},
    {cl:TEAL,t:"框架",d:"五维度财务穿透\u2192\n超越单一指标"},
    {cl:R,t:"方法",d:"三案例正反验证\u2192\n补齐反面证据"},
  ];
  pos.forEach(function(p,i){
    const x=0.7+i*3.1;
    C(s,x,4.65,2.8,0.55,LG); s.addShape(pres.shapes.RECTANGLE,{x,y:4.65,w:0.04,h:0.55,fill:{color:p.cl}});
    T(s,x+0.15,4.7,0.8,0.25,p.t,12,p.cl,true,"Arial Black"); T(s,x+1.0,4.7,1.6,0.45,p.d,9,G);
  });
})();

// ===== S4: CONCLUSION =====
(function(){
  const s=pres.addSlide(); s.background={color:W};
  s.addShape(pres.shapes.RECTANGLE,{x:0,y:0,w:10,h:0.04,fill:{color:B}});
  T(s,0.6,0.2,8.8,0.45,"本章小结",22,D,true,"Arial Black");

  const items=[
    {n:"1",cl:B,
      body:"理论基础层面，本研究以资源基础观（Barney, 1986）、核心能力理论（Prahalad & Hamel, 1990）和商业模式理论（Osterwalder & Pigneur, 2010）为三大支柱，辅以动态能力理论（Teece, 2009）和八步变革模型（Kotter, 1996），并系统梳理了PEST、波特五力、SWOT等八项战略管理分析工具及其在论文各章的运用方案。"},
    {n:"2",cl:TEAL,
      body:"文献综述层面，梳理了轻资产运营（\u201C轻\u201D与\u201C控\u201D的平衡命题）、REITs研究（去杠杆效应与\u201C出表不降杠杆\u201D现象）和商业地产转型（案例积累但缺乏理论提炼）三个领域。共同不足：未形成从交易结构到转型效应的统一框架、评估停留在单一指标、缺少正反案例对比验证。"},
    {n:"3",cl:R,
      body:"研究定位层面，以战略管理视角整合三个碎片化领域，构建\u201C交易结构-出表效果-转型效应\u201D全链条分析框架，采用五维度财务穿透评估法，设计华润（正向）+凯德（验证）+苏宁（反面）三案例对比方案，系统回应三项文献不足。"},
  ];
  items.forEach(function(it,i){
    const y=0.8+i*1.5;
    C(s,0.5,y,9.0,1.35,LG);
    s.addShape(pres.shapes.OVAL,{x:0.65,y:y+0.3,w:0.55,h:0.55,fill:{color:it.cl}});
    T(s,0.65,y+0.38,0.55,0.4,it.n,18,W,true,"Arial Black","center");
    T(s,1.45,y+0.1,7.8,1.1,it.body,9,G);
  });
})();

pres.writeFile({fileName:"/Users/op/WorkBuddy/论文优化/文献综述.pptx"})
  .then(function(){console.log("Done:4 slides");}).catch(function(err){console.error(err);});
