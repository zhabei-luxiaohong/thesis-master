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
function bar(s) { s.addShape(pres.shapes.RECTANGLE,{x:0,y:0,w:10,h:0.04,fill:{color:B}}); }

// ===== S1: COVER =====
(function(){
  const s=pres.addSlide(); s.background={color:D};
  s.addShape(pres.shapes.RECTANGLE,{x:0.7,y:1.3,w:0.05,h:2.8,fill:{color:B}});
  T(s,1.0,1.4,8.5,0.45,"第三章",12,B,true); T(s,1.0,1.85,8.5,1.0,"研究方案",34,W,true,"Arial Black");
  T(s,1.0,3.0,8.5,0.7,"研究问题与假设 \u2192 案例选择 \u2192 分析框架 \u2192 数据与方法",12,DG);
})();

// ===== S2: RESEARCH QUESTIONS + HYPOTHESES =====
(function(){
  const s=pres.addSlide(); s.background={color:W}; bar(s);
  T(s,0.6,0.2,8.8,0.45,"研究问题与假设（3.1）",22,D,true,"Arial Black");

  // Core question
  C(s,0.5,0.75,9.0,0.45,D);
  T(s,0.7,0.8,8.6,0.35,"核心问题：REITs如何驱动商业地产企业从重资产持有模式向轻资产运营模式转型？",11,W,true);

  // Five sub-questions
  const sq=[
    {n:"SQ1",t:"驱动因素",d:"行业环境变化、企业战略选择和金融工具创新如何形成共振？"},
    {n:"SQ2",t:"转型路径",d:"REITs发行前后的组织变革、业务重构和运营模式调整有哪些关键环节？"},
    {n:"SQ3",t:"财务效应",d:"从资产结构、收入结构、盈利质量和资本效率等维度，转型的财务效应如何？"},
    {n:"SQ4",t:"运营效应",d:"从管理规模、运营效率和品牌价值三维度，转型的运营效应如何？"},
    {n:"SQ5",t:"边界条件",d:"通过主案例与验证案例、反面案例对比，成功转型的边界条件是什么？"},
  ];
  sq.forEach(function(q,i){
    const y=1.35+i*0.42;
    T(s,0.6,y,0.45,0.18,q.n,8,B,true,"Arial Black"); T(s,1.1,y,0.9,0.18,q.t,9,D,true); T(s,2.0,y,7.2,0.35,q.d,9,G);
  });

  // Five hypotheses
  C(s,0.5,3.6,9.0,1.7,W);
  T(s,0.7,3.7,0.9,0.25,"五个假设",11,B,true);
  const hyps=[
    {cl:B,t:"H\u2081 收入结构",d:"REITs发行与经常性收入占比正相关。管理费收入等经常性收入占比应显著提升。"},
    {cl:TEAL,t:"H\u2082 杠杆水平",d:"轻资产转型程度与净负债率负相关。REITs通过资产出表和资本回收降低财务杠杆。"},
    {cl:"E67E22",t:"H\u2083 运营能力",d:"运营能力成熟度是转型成功的必要条件。出租率、收缴率、外拓占比与财务效应正相关。"},
    {cl:R,t:"H\u2084 交易结构",d:"真实出售结构的资产负债率改善效果显著优于售后租回结构（Hardin & Wu, 2010）。"},
    {cl:"8B5CF6",t:"H\u2085 资本循环",d:"具备培育-成熟-退出-再投资完整循环的企业，转型效应更持久。"},
  ];
  hyps.forEach(function(h,i){
    const x=0.5+(i%3)*3.05,y=i<3?4.0:4.65;
    C(s,x,y,2.9,0.5,LG); s.addShape(pres.shapes.RECTANGLE,{x,y,w:0.04,h:0.5,fill:{color:h.cl}});
    T(s,x+0.15,y+0.04,2.2,0.22,h.t,10,D,true); T(s,x+0.15,y+0.24,2.6,0.22,h.d,7.5,G);
  });
})();

// ===== S3: CASE SELECTION =====
(function(){
  const s=pres.addSlide(); s.background={color:W}; bar(s);
  T(s,0.6,0.2,8.8,0.45,"案例选择与依据（3.2）",22,D,true,"Arial Black");

  T(s,0.6,0.7,8.8,0.3,"采用Yin（2018）案例选择原则，从典型性、启示性和数据可得性三个维度，对七家候选企业综合比较后选定三个案例。",9,DG);

  // Three case cards
  const cases=[
    {
      cl:B, tag:"主案例", name:"华润置地 / 华润万象生活", role:"深度分析 \u2192 构建理论框架",
      reasons:"\u2460 转型路径完整清晰：重资产开发商\u2192商管分拆上市(2020)\u2192REITs发行(2024)\u2192双平台协同\n\u2461 双平台模式学术创新性：商管平台+REITs平台协同国内首创\n\u2462 数据完整：港交所上市公司，信息披露规范\n\u2463 行业标杆：中国商业地产龙头，示范效应显著",
    },
    {
      cl:TEAL, tag:"验证案例", name:"凯德集团", role:"跨国对比 \u2192 检验外部效度",
      reasons:"\u2460 国际标杆：亚洲最大不动产集团之一，最早实践私募基金+REITs闭环\n\u2461 资本闭环完整：开发型基金-持有型基金-REITs三层架构\n\u2462 中国市场深度参与：深耕超30年，旗下CLCT和华夏凯德REIT涉及中国商业地产\n\u2463 与华润可比：同中有异，有利于验证结论普适性",
    },
    {
      cl:R, tag:"反面案例", name:"苏宁易购", role:"对比分析 \u2192 验证边界条件",
      reasons:"\u2460 典型失败案例：2015年起多次发行类REITs/ABS累计超100亿元，负债率从约65%攀升至约91%\n\u2461 检验H4和H5：多采用售后租回，缺乏完整培育-退出-再投资循环\n\u2462 数据可得：A股上市公司，财务数据和发行文件公开",
    },
  ];
  cases.forEach(function(cs,i){
    const x=0.3+i*3.2;
    C(s,x,1.15,3.05,4.1,W); s.addShape(pres.shapes.RECTANGLE,{x,y:1.15,w:3.05,h:0.05,fill:{color:cs.cl}});
    T(s,x+0.12,1.28,1.0,0.2,cs.tag,8,cs.cl,true); T(s,x+1.1,1.28,1.8,0.2,cs.role,7,G);
    T(s,x+0.12,1.55,2.8,0.35,cs.name,12,D,true);
    s.addShape(pres.shapes.RECTANGLE,{x:x+0.12,y:1.95,w:2.8,h:0.01,fill:{color:cs.cl}});
    T(s,x+0.12,2.05,2.8,3.05,cs.reasons,8,G);
  });
})();

// ===== S4: ANALYSIS FRAMEWORK =====
(function(){
  const s=pres.addSlide(); s.background={color:W}; bar(s);
  T(s,0.6,0.15,8.8,0.4,"分析框架构建（3.3）",22,D,true,"Arial Black");

  // LEFT: Three-layer + Five-stage
  // Three-layer framework
  T(s,0.5,0.65,4.5,0.22,"三层总体框架",10,B,true);
  C(s,0.5,0.9,4.5,1.2,LG);
  T(s,0.65,0.98,4.2,0.8,[
    {text:"第一层 REITs驱动：制度功能（资产出表/资本退出/价值发现）\u2194企业战略需求（降杠杆/提效率/可持续盈利）\n\n",options:{fontSize:8,color:D,bold:true,breakLine:true}},
    {text:"第二层 路径选择：分拆上市+REITs发行双平台（华润） vs 私募基金+REITs资本闭环（凯德）\n\n",options:{fontSize:8,color:G,breakLine:true}},
    {text:"第三层 效应评估：财务效应（五维度） + 运营效应（三维度）",options:{fontSize:8,color:G}},
  ],{margin:0});

  // Five-stage path
  T(s,0.5,2.25,4.5,0.22,"五阶段转型路径模型",10,B,true);
  const stages=[
    {n:"\u2460",t:"重资产持有期",d:"重资产/高杠杆/低周转"},
    {n:"\u2461",t:"资产剥离与分拆期",d:"业务重构/组织调整"},
    {n:"\u2462",t:"轻资产平台建设期",d:"管理输出/品牌扩张"},
    {n:"\u2463",t:"REITs资本退出期",d:"资产出表/资本回收"},
    {n:"\u2464",t:"资本闭环循环期",d:"双平台协同/再投资"},
  ];
  stages.forEach(function(st,i){
    const y=2.55+i*0.52;
    C(s,0.5,y,4.5,0.45,LG); s.addShape(pres.shapes.RECTANGLE,{x:0.5,y,w:0.04,h:0.45,fill:{color:B}});
    T(s,0.65,y+0.04,0.3,0.2,st.n,9,B,true,"Arial Black");
    T(s,1.0,y+0.04,1.5,0.2,st.t,9,D,true); T(s,2.5,y+0.04,2.3,0.35,st.d,8,G);
    if(i<4) T(s,2.2,y+0.32,0.3,0.2,"\u2192",9,B,true);
  });

  // RIGHT: Five-dimension finance + Hypothesis testing
  T(s,5.3,0.65,4.5,0.22,"五维度财务效应评估",10,B,true);
  C(s,5.3,0.9,4.3,2.0,LG);
  const dims=[
    {cl:B,n:"\u2460 资产轻量化",m:"投资性房地产占比/资产周转率/总资产增速"},
    {cl:TEAL,n:"\u2461 收入结构",m:"经常性收入占比/管理费收入占比"},
    {cl:"E67E22",n:"\u2462 盈利质量",m:"经常性利润占比/毛利率/净利率"},
    {cl:R,n:"\u2463 现金流",m:"经营现金流/净利润比率/自由现金流/资本支出占比"},
    {cl:"8B5CF6",n:"\u2464 资本效率",m:"ROE/ROA/资产负债率/净负债率"},
  ];
  dims.forEach(function(d,i){
    T(s,5.5,0.98+i*0.36,2.0,0.18,d.n,9,d.cl,true); T(s,7.5,0.98+i*0.36,1.9,0.32,d.m,7,G);
  });

  // Hypothesis testing framework
  T(s,5.3,3.05,4.5,0.22,"假设检验框架",10,B,true);
  C(s,5.3,3.3,4.3,1.85,LG);
  const tests=[
    {h:"H\u2081",ind:"经常性收入占比",src:"利润表",exp:"华润、凯德\u2191；苏宁\u2194"},
    {h:"H\u2082",ind:"净负债率",src:"资产负债表",exp:"华润、凯德\u2193；苏宁\u2191"},
    {h:"H\u2083",ind:"运营能力与财务效应相关性",src:"运营+财务数据",exp:"正相关"},
    {h:"H\u2084",ind:"交易结构与负债率改善",src:"REITs文件+财报",exp:"真实出售>售后租回"},
    {h:"H\u2085",ind:"资本循环完整性与持续性",src:"案例追踪",exp:"完整循环更持久"},
  ];
  T(s,5.5,3.38,0.5,0.18,"假设",7,G); T(s,6.0,3.38,1.2,0.18,"检验指标",7,G); T(s,7.2,3.38,0.9,0.18,"数据来源",7,G); T(s,8.1,3.38,1.3,0.18,"预期结果",7,G);
  s.addShape(pres.shapes.RECTANGLE,{x:5.5,y:3.57,w:3.9,h:0.01,fill:{color:G}});
  tests.forEach(function(t,i){
    const y=3.65+i*0.28;
    T(s,5.5,y,0.5,0.18,t.h,8,B,true); T(s,6.0,y,1.2,0.22,t.ind,7,G); T(s,7.2,y,0.9,0.22,t.src,7,G); T(s,8.1,y,1.3,0.22,t.exp,7,G);
    if(i<4) s.addShape(pres.shapes.RECTANGLE,{x:5.5,y:y+0.23,w:3.9,h:0.005,fill:{color:"E8E8E8"}});
  });
})();

// ===== S5: DATA + METHODS + ARGUMENTS =====
(function(){
  const s=pres.addSlide(); s.background={color:W}; bar(s);
  T(s,0.6,0.15,8.8,0.4,"数据来源、研究方法与拟提观点（3.4-3.6）",22,D,true,"Arial Black");

  // LEFT: Data sources (3.4)
  C(s,0.4,0.7,4.6,2.1,LG);
  T(s,0.6,0.78,4.2,0.22,"数据来源（3.4）",11,B,true);
  T(s,0.6,1.08,4.2,1.6,[
    {text:"全部来自公开披露资料，遵循公开性、多源交叉验证、时效性（2020-2025）三项原则。\n\n",options:{fontSize:8,color:G,breakLine:true}},
    {text:"华润：港交所年报(2020-2025)+华润商业REIT招募说明书+公司公告+Wind/戴德梁行\n\n",options:{fontSize:8,color:D,breakLine:true}},
    {text:"凯德：新交所年报(2020-2025)+CLCT年报+华夏凯德REIT发行文件+新加坡金管局数据\n\n",options:{fontSize:8,color:TEAL,breakLine:true}},
    {text:"苏宁：深交所年报(2015-2023)+ABS发行文件+财经媒体深度报道",options:{fontSize:8,color:R}},
  ],{margin:0});

  // RIGHT: Methods (3.5)
  C(s,5.2,0.7,4.5,2.1,LG);
  T(s,5.4,0.78,4.1,0.22,"研究方法（3.5）",11,B,true);
  const methods=[
    {n:"文献研究法",d:"贯穿全过程：框架构建+不足识别+工具借鉴。来源：WoS/CNKI/万方/行业报告"},
    {n:"案例研究法",d:"Yin(2018)多案例设计：华润纵向深度+凯德横向对比+苏宁失败验证"},
    {n:"财务穿透分析法",d:"五维度2020-2025时间序列，识别拐点和时滞效应。异常数据交叉验证"},
    {n:"对比分析法",d:"三个层面：转型前后纵向+华润vs凯德横向+企业与行业基准对比"},
  ];
  methods.forEach(function(m,i){
    T(s,5.4,1.08+i*0.42,1.2,0.18,m.n,9,D,true); T(s,6.6,1.08+i*0.42,2.9,0.35,m.d,8,G);
  });

  // BOTTOM: Main arguments (3.6)
  C(s,0.4,3.0,9.3,2.2,D);
  T(s,0.6,3.08,8.9,0.22,"拟提出的主要观点（3.6）",11,W,true);
  T(s,0.6,3.4,8.9,1.7,[
    {text:"（1）转型路径：REITs驱动轻资产转型可归纳为\u201C能力建设\u2192平台独立\u2192规模扩张\u2192资本退出\u2192协同优化\u201D五阶段模型。\n\n",options:{fontSize:9,color:"BBCCDD",breakLine:true}},
    {text:"（2）财务效应：表现为收入结构优化、盈利质量改善、现金流改善和杠杆率下降四个方面。运营效应：表现为管理规模扩张、运营效率提升和品牌价值实现。\n\n",options:{fontSize:9,color:"BBCCDD",breakLine:true}},
    {text:"（3）五个边界条件：REITs制度环境成熟度、底层资产运营质量、运营管理能力成熟度、资本循环通道畅通性、战略清晰度和持续性。\n\n",options:{fontSize:9,color:"BBCCDD",breakLine:true}},
    {text:"（4）核心机制：\u201C三重驱动、双重闭环\u201D\u2014\u2014三重驱动指行业环境变化、企业战略调整、金融工具创新；双重闭环指资本闭环和能力闭环的相互促进。",options:{fontSize:9,color:"99AABB"}},
  ],{margin:0});

  // Application value (brief)
  C(s,0.4,5.28,9.3,0.3,D);
  T(s,0.6,5.31,8.9,0.25,"应用价值：为企业提供两条可复制路径+五阶段诊断模型，为投资者提供五维度评估工具，为监管层提供制度优化方向。",8,"8899BB");
})();

pres.writeFile({fileName:"/Users/op/WorkBuddy/论文优化/研究方案.pptx"})
  .then(function(){console.log("Done:5 slides");}).catch(function(err){console.error(err);});
