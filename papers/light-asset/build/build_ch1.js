const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
const B = "0056A0", D = "1A1A2E", R = "C0392B", G = "555555";
const LG = "F2F4F7", W = "FFFFFF", DG = "888899", TEAL = "00796B", ORANGE = "E67E22";

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
  T(s,1.0,1.4,8.5,0.45,"第一章",12,B,true);
  T(s,1.0,1.85,8.5,1.0,"选题背景与研究问题",34,W,true,"Arial Black");
  T(s,1.0,3.0,8.5,0.7,"宏观压力 \u2192 行业危机 \u2192 REITs破局 \u2192 问题提出",12,DG);
})();

// ===== S2: MACRO CAUSAL CHAIN =====
(function(){
  const s=pres.addSlide(); s.background={color:W}; bar(s);
  T(s,0.6,0.15,8.8,0.45,"宏观压力：从贸易战到债务暴雷的逻辑链条",22,D,true,"Arial Black");

  // Seven nodes in a cascading chain
  const nodes=[
    {n:"\u2460",t:"贸易战",y:2018,desc:"中美贸易摩擦加剧，\n出口承压，经济增速放缓，\n制造业投资意愿下降。",cl:B},
    {n:"\u2461",t:"疫情冲击",y:2020,desc:"经济骤然停摆，\n居民收入预期恶化，\n消费信心遭受重创。",cl:TEAL},
    {n:"\u2462",t:"房住不炒",y:"2016至今",desc:"中央定调住房回归\n居住属性，投机需求\n被持续打压。",cl:"E67E22"},
    {n:"\u2463",t:"三条红线",y:2020,desc:"房企融资端收紧：\n剔除预收款资产负债率、\n净负债率、现金短债比\n三项硬指标划定生死线。",cl:R},
  ];
  const nodes2=[
    {n:"\u2464",t:"泡沫破裂",desc:"房价下行、地价下跌，\n房企资产端与负债端\n同时承压，估值体系崩塌。",cl:"8B5CF6"},
    {n:"\u2465",t:"需求萎缩",desc:"销售面积和销售额\n持续下滑，库存积压，\n回款周期大幅延长。",cl:"0891B2"},
    {n:"\u2466",t:"债务暴雷",desc:"恒大、碧桂园等头部\n房企相继违约，信用\n危机向全行业蔓延。",cl:D},
  ];

  // Row 1: first four nodes
  nodes.forEach(function(nd,i){
    const x=0.3+i*2.4;
    C(s,x,0.7,2.2,2.3,W);
    s.addShape(pres.shapes.RECTANGLE,{x,y:0.7,w:2.2,h:0.05,fill:{color:nd.cl}});
    // Number + Title
    T(s,x+0.08,0.82,0.3,0.2,nd.n,10,nd.cl,true,"Arial Black");
    T(s,x+0.4,0.82,1.0,0.2,nd.t,12,D,true);
    T(s,x+1.4,0.82,0.7,0.2,nd.y,8,DG);
    // Desc
    T(s,x+0.12,1.15,1.95,0.9,nd.desc,8,G);
    // Arrow between nodes
    if(i<3) T(s,x+2.15,1.6,0.3,0.3,"\u2192",16,B,true);
  });

  // Row 2: last three nodes + impact summary
  nodes2.forEach(function(nd,i){
    const x=0.3+i*2.4;
    C(s,x,3.15,2.2,1.5,W);
    s.addShape(pres.shapes.RECTANGLE,{x,y:3.15,w:2.2,h:0.05,fill:{color:nd.cl}});
    T(s,x+0.08,3.22,0.3,0.2,nd.n,10,nd.cl,true,"Arial Black");
    T(s,x+0.4,3.22,1.0,0.2,nd.t,12,D,true);
    T(s,x+0.12,3.52,1.95,0.6,nd.desc,8,G);
    if(i<2) T(s,x+2.15,3.7,0.3,0.3,"\u2192",16,B,true);
  });

  // Right side: impact on commercial real estate
  C(s,7.5,3.15,2.1,1.5,R);
  T(s,7.6,3.22,1.9,0.2,"\u2192 商业地产",9,W,true,"Arial","center");
  T(s,7.6,3.5,1.9,1.0,"房地产全行业信用崩塌，商业地产亦无法独善其身。重资产模式下的\u201C资产沉淀-负债攀升-盈利承压\u201D恶性循环加速恶化，企业急需资产退出通道。",8,W);
  T(s,7.5,3.55,0.3,0.3,"\u2192",16,W,true);

  // Bottom: the question this chain leads to
  C(s,0.5,4.85,9.0,0.55,D);
  T(s,0.7,4.92,8.6,0.4,"七重压力层层传导，最终指向同一个问题：商业地产企业如何从重资产困局中突围？REITs正是在这一背景下被推到台前。",10,W,true);
})();

// ===== S3: INDUSTRY CRISIS DEPTH =====
(function(){
  const s=pres.addSlide(); s.background={color:W}; bar(s);
  T(s,0.6,0.15,8.8,0.45,"行业现状：危机的深度",22,D,true,"Arial Black");

  // Key numbers
  const nums=[
    {v:"77.27%",l:"大悦城控股\n资产负债率",cl:R},
    {v:"70.81%",l:"新城控股\n资产负债率",cl:ORANGE},
    {v:"60.23%",l:"龙湖集团\n净负债率",cl:TEAL},
    {v:"14.2%",l:"华润置地\n开发毛利率(2024)",cl:B},
  ];
  nums.forEach(function(n,i){
    const x=0.3+i*2.4;
    C(s,x,0.7,2.2,1.2,LG);
    T(s,x+0.1,0.8,2.0,0.6,n.v,28,n.cl,true,"Arial Black","center");
    T(s,x+0.1,1.4,2.0,0.4,n.l,8,G,"Arial","center");
  });

  // The vicious cycle narrative
  C(s,0.3,2.1,9.4,1.5,LG);
  T(s,0.6,2.2,8.8,1.3,[
    {text:"危机的根源在于商业地产的商业模式本身。\n\n",options:{fontSize:12,color:D,bold:true,breakLine:true}},
    {text:"与住宅开发\u201C拿地-开发-销售\u201D的快速周转模式不同，商业地产需要长期持有并持续运营，投资回收期通常长达10至15年。企业将巨额资本沉淀在投资性房地产中，既推高了资产负债率，又严重压缩了再投资能力。\n\n",options:{fontSize:10,color:G,breakLine:true}},
    {text:"以华润置地为例：2020年末投资性房地产2,363亿元，占总资产超30%。开发毛利率从2019年的50.3%一路下滑，至2024年仅剩14.2%，六年跌去36个百分点。2025年小幅回升至15.5%，但距离高位相去甚远。\n\n",options:{fontSize:10,color:G,breakLine:true}},
    {text:"\u201C资产沉淀 \u2192 负债攀升 \u2192 盈利承压 \u2192 再投资能力下降\u201D的恶性循环，在前述七重宏观压力下加速恶化。",options:{fontSize:10,color:R,bold:true}},
  ],{margin:0});

  // Light asset transformation concept
  C(s,0.3,3.8,9.4,1.6,D);
  T(s,0.6,3.9,8.8,0.25,"轻资产转型：从\u201C资产持有者\u201D到\u201C资产运营者\u201D",13,W,true);
  T(s,0.6,4.25,8.8,1.0,[
    {text:"轻资产运营的核心在于将\u201C资产持有者\u201D与\u201C资产运营者\u201D的角色分离。国际经验已经证明这条路径的可行性：美国西蒙地产通过REITs架构实现\u201C开发-运营-退出-再投资\u201D的资本循环；新加坡凯德集团构建\u201C私募基金+REITs\u201D双轮驱动，负债率从78%降至约42%。\n\n",options:{fontSize:9,color:"BBCCDD",breakLine:true}},
    {text:"在中国，华润置地开创的\u201C商管平台分拆上市+REITs发行\u201D双平台模式，成为行业标杆。华润万象生活2025年营收180.22亿元，经常性利润占比首次突破50%达51.8%。",options:{fontSize:9,color:"8899BB"}},
  ],{margin:0});

  T(s,0.5,5.5,9.0,0.15,"各公司2025年年报；华润置地年度报告（2019-2025）；Wind",7,"999999");
})();

// ===== S4: REITs AS THE POLICY RESPONSE =====
(function(){
  const s=pres.addSlide(); s.background={color:W}; bar(s);
  T(s,0.6,0.15,8.8,0.4,"政策破局：REITs打开资产退出通道",22,D,true,"Arial Black");

  // Context: why REITs is the answer
  C(s,0.5,0.65,9.0,0.55,D);
  T(s,0.7,0.72,8.6,0.4,"当债务暴雷堵死了传统的融资和销售回款路径，REITs成为商业地产企业为数不多的资产退出通道。中国的REITs制度正是在这一压力下加速推进。",9,W);

  // Three phases
  const phases=[
    {
      year:"2020-2022",t:"试点启动",cl:B,
      detail:"2020年4月证监会与发改委联合发文，首批聚焦基础设施。2021年6月首批9只上市，募资314亿元。完成制度框架搭建，但商业地产尚未纳入。"
    },
    {
      year:"2023-2024",t:"消费扩容",cl:TEAL,
      detail:"2023年3月证监会将购物中心等消费基础设施纳入REITs底层资产，商业地产通道正式打开。2024年成为消费REITs元年：华润商业REIT（69.23亿）、大悦城商业REIT（33亿）、印力消费REIT相继上市，全年消费类REITs发行超200亿元。"
    },
    {
      year:"2025至今",t:"常态化发行",cl:R,
      detail:"发行制度从审批制转向注册制，市场进入常态化阶段。截至2025年3月，公募REITs总规模突破2,100亿元，上市产品58只。华夏凯德商业REIT（22.87亿）上市，成为首单外资消费REITs。"
    },
  ];

  phases.forEach(function(p,i){
    const y=1.35+i*1.35;
    C(s,0.5,y,9.0,1.2,LG);
    s.addShape(pres.shapes.RECTANGLE,{x:0.5,y,w:0.04,h:1.2,fill:{color:p.cl}});
    // Year range
    T(s,0.7,y+0.08,1.2,0.25,p.year,10,p.cl,true);
    // Title
    T(s,1.9,y+0.08,2.0,0.25,p.t,14,D,true);
    // Detail
    T(s,1.9,y+0.42,7.3,0.68,p.detail,9,G);
  });

  T(s,0.6,5.45,8.8,0.15,"证监会、发改委政策文件；Wind；各REITs招募说明书",7,"999999");
})();

// ===== S5: RESEARCH QUESTIONS =====
(function(){
  const s=pres.addSlide(); s.background={color:W}; bar(s);
  T(s,0.6,0.15,8.8,0.4,"问题提出：REITs如何驱动轻资产转型？",22,D,true,"Arial Black");

  // Contextual bridge from crisis to questions
  C(s,0.5,0.65,9.0,0.55,D);
  T(s,0.7,0.7,8.6,0.45,"从贸易战到债务暴雷的七重压力，将商业地产行业逼到了转型的临界点。REITs政策的加速推进打开了一条出路，但三个关键问题亟待回答：",9,W);

  // Three research questions
  const qs=[
    {
      n:"Q1",t:"路径",cl:B,
      d:"从重资产持有到轻资产运营，企业需要经历哪些关键的组织变革和资本运作？华润的\u201C双平台\u201D模式与凯德的\u201C资本闭环\u201D模式，各自的内在机制和适用条件是什么？"
    },
    {
      n:"Q2",t:"效应",cl:TEAL,
      d:"REITs发行对企业的资产负债表、利润表和现金流量表产生了哪些具体影响？如何构建一个系统性的评估框架，从资产结构、收入质量、盈利能力、现金流和资本效率等多维度全面衡量转型效果？"
    },
    {
      n:"Q3",t:"条件",cl:R,
      d:"并非所有引入REITs的企业都能成功转型。苏宁易购通过类REITs和ABS融资后负债率从65%升至91%，\u201C出表不降杠杆\u201D的失败案例提示：什么条件下REITs才能真正推动转型，而非沦为财务工具？"
    },
  ];

  qs.forEach(function(q,i){
    const y=1.35+i*1.35;
    C(s,0.5,y,9.0,1.2,LG);
    s.addShape(pres.shapes.RECTANGLE,{x:0.5,y,w:0.04,h:1.2,fill:{color:q.cl}});
    T(s,0.7,y+0.06,0.4,0.25,q.n,16,q.cl,true,"Arial Black");
    T(s,1.15,y+0.06,0.85,0.25,q.t,13,D,true);
    T(s,2.05,y+0.06,7.1,0.4,q.d,10,G);
  });

  C(s,0.5,5.45,9.0,0.15,D);
  T(s,0.6,5.47,8.8,0.12,"本研究以华润置地/万象生活（主案例）、凯德集团（验证案例）、苏宁易购（反面案例）三家企业为样本，系统回答上述问题",9,W,true);
})();

pres.writeFile({fileName:"/Users/op/WorkBuddy/论文优化/选题背景.pptx"})
  .then(function(){console.log("Done:5 slides");}).catch(function(err){console.error(err);});
