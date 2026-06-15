"use strict";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const companies = [
  { ticker:"NOVA", name:"Nova Devices", sector:"Consumer Technology", price:48.20, revenue:820, profit:74, debt:190, growth:.12, volatility:.035, dividendYield:.012, cycleSensitivity:1.25, inflationSensitivity:.7 },
  { ticker:"GRNW", name:"Greenway Energy", sector:"Renewable Energy", price:31.60, revenue:510, profit:39, debt:240, growth:.18, volatility:.045, dividendYield:.008, cycleSensitivity:.9, inflationSensitivity:.45 },
  { ticker:"HARB", name:"Harbor Foods", sector:"Consumer Staples", price:62.10, revenue:1120, profit:96, debt:120, growth:.05, volatility:.018, dividendYield:.032, cycleSensitivity:.3, inflationSensitivity:.8 },
  { ticker:"AXIS", name:"Axis Logistics", sector:"Transportation", price:25.80, revenue:680, profit:42, debt:310, growth:.08, volatility:.03, dividendYield:.021, cycleSensitivity:1.05, inflationSensitivity:1.2 },
  { ticker:"MEDI", name:"Mediora Labs", sector:"Healthcare", price:79.40, revenue:390, profit:51, debt:85, growth:.22, volatility:.055, dividendYield:0, cycleSensitivity:.4, inflationSensitivity:.35 }
].map((c,index) => ({...c, previous:c.price, history:Array.from({length:30},(_,i)=>c.price*(.92+i*.003+Math.random()*.06)), book:{bids:[],asks:[]}, totalShares:index===0?undefined:1000000, novaStake:0, takeoverDefense:0, controlled:false, quarterlyRevenue:0, quarterlyProfit:0, reports:[], analystRevenue:c.revenue/4*(.97+Math.random()*.06), analystProfit:c.profit/4*(.94+Math.random()*.12)}));

Object.assign(companies[0], {
  companyCash:42,
  inventory:2400,
  productPrice:780,
  unitCost:420,
  production:1000,
  marketing:100,
  research:80,
  quality:1,
  dailySales:0,
  dailyOperatingProfit:0,
  dailyRevenue:0,
  marketShare:.18,
  totalShares:1000000,
  founderShares:560000,
  bondDebt:0,
  bondRate:.06,
  dailyInterest:0,
  products:[
    {name:"Nova Core",segment:"Mainstream",active:true,launchCost:0,price:780,unitCost:420,production:1000,marketing:100,quality:1,inventory:2400,dailySales:0,competitorPrice:760,marketPotential:1150},
    {name:"Nova Value",segment:"Budget",active:false,launchCost:8,price:490,unitCost:285,production:800,marketing:60,quality:.82,inventory:0,dailySales:0,competitorPrice:520,marketPotential:1450},
    {name:"Nova Pro",segment:"Premium",active:false,launchCost:12,price:1280,unitCost:690,production:500,marketing:120,quality:1.18,inventory:0,dailySales:0,competitorPrice:1220,marketPotential:680}
  ],
  pendingDecisions:null
});

function createAiFunds() {
  return [
    {name:"Northstar Value",strategy:"Value",color:"#55a7ff",cash:240000,startWorth:240000,holdings:{HARB:900,AXIS:500}},
    {name:"Velocity Partners",strategy:"Momentum",color:"#3ddc97",cash:190000,startWorth:190000,holdings:{NOVA:700,MEDI:350}},
    {name:"Ironclad Macro",strategy:"Macro",color:"#f3bd58",cash:280000,startWorth:280000,holdings:{GRNW:800,HARB:450}},
    {name:"Black Reef Capital",strategy:"Short seller",color:"#ff6474",cash:220000,startWorth:220000,holdings:{AXIS:-350,MEDI:-180}}
  ];
}

const state = {
  day:1, cash:100000, startWorth:100000, selected:0, side:"buy", orderType:"market",
  holdings:{}, averageCost:{}, news:[], openOrders:[], ledger:[],
  economy:{interestRate:.04,inflation:.025,confidence:100,growth:.022,fuelIndex:100,regime:"Steady expansion"},
  difficulty:"normal", gameOver:false, takeoverNotice:"No active takeover campaign", selectedProduct:0,
  advisorStep:0, advisorHidden:false, optionType:"call", optionPositions:[],
  aiFunds:createAiFunds(), institutionActivity:[], marketRipples:[], unlockedMilestones:["basic"],
  equityHistory:[100000], dayStartEquity:100000
};
const SAVE_KEY="market-foundry-save-v5";
const initialCompanies=JSON.parse(JSON.stringify(companies));
const initialState=JSON.parse(JSON.stringify(state));
let orderId = 0;
const progressionMilestones = [
  {id:"basic",name:"Cash Trader",description:"Market buy and sell orders",worth:0,day:1},
  {id:"limit",name:"Order Specialist",description:"Limit orders and patient execution",worth:105000,day:10},
  {id:"short",name:"Margin License",description:"Short selling under an equity limit",worth:112500,day:25},
  {id:"options",name:"Derivatives Desk",description:"Calls, puts, and expiry management",worth:125000,day:50},
  {id:"ma",name:"Deal Maker",description:"Strategic stakes and corporate takeovers",worth:145000,day:90}
];

function featureUnlocked(id) {
  const milestone=progressionMilestones.find(item=>item.id===id);
  return !milestone || state.day>=milestone.day || accountEquity()>=milestone.worth;
}

function checkProgression() {
  if (!Array.isArray(state.unlockedMilestones)) state.unlockedMilestones=["basic"];
  progressionMilestones.forEach(milestone=>{
    if (featureUnlocked(milestone.id) && !state.unlockedMilestones.includes(milestone.id)) {
      state.unlockedMilestones.push(milestone.id);
      state.news.unshift({day:state.day,ticker:"LICENSE",impact:.01,text:`${milestone.name} unlocked: ${milestone.description}.`});
      state.news=state.news.slice(0,6);
      addLedger(`Unlocked ${milestone.name}`,0);
    }
  });
}

function addOrder(company, side, price, quantity, trader="AI") {
  const order = { id:orderId++, side, price:+price.toFixed(2), quantity, trader, time:orderId };
  const book = side === "buy" ? company.book.bids : company.book.asks;
  book.push(order);
  book.sort((a,b) => side === "buy" ? b.price-a.price || a.time-b.time : a.price-b.price || a.time-b.time);
}

function seedBook(company) {
  company.book = { bids:[], asks:[] };
  for (let i=0;i<7;i++) {
    addOrder(company,"buy",company.price*(1-.0015-i*.002-Math.random()*.001),20+Math.floor(Math.random()*180));
    addOrder(company,"sell",company.price*(1+.0015+i*.002+Math.random()*.001),20+Math.floor(Math.random()*180));
  }
}

function fillMarketOrder(company, side, requested) {
  const book = side === "buy" ? company.book.asks : company.book.bids;
  let remaining=requested, value=0, filled=0;
  while (remaining>0 && book.length) {
    const top=book[0], amount=Math.min(remaining,top.quantity);
    value += amount*top.price; filled += amount; remaining -= amount; top.quantity -= amount;
    if (!top.quantity) book.shift();
  }
  if (filled) company.price=value/filled;
  return { filled, value, average:filled ? value/filled : 0 };
}

function executeTrade() {
  const company=companies[state.selected], qty=Math.max(0,Math.floor(+document.querySelector("#quantity").value));
  if (!qty) return message("Enter at least one share.",false);
  if (state.orderType === "limit") {
    if (!featureUnlocked("limit")) return message("Limit orders unlock at $105,000 net worth or day 10.",false);
    const limit=+document.querySelector("#limit-price").value;
    if (!(limit>0)) return message("Enter a valid limit price.",false);
    const order={id:orderId++,ticker:company.ticker,side:state.side,quantity:qty,limit:+limit.toFixed(2),day:state.day};
    state.openOrders.push(order);
    addLedger(`Placed ${state.side} limit order for ${qty} ${company.ticker}`,0);
    message(`Limit order placed at ${money.format(order.limit)}.`,true);
    processOpenOrders(); render();
    return;
  }
  const result=executeMarketTrade(company,state.side,qty);
  if (result && !result.ok) message(result.reason,false);
}

function executeMarketTrade(company,side,qty,limit=null,renderAfter=true) {
  const book=side === "buy" ? company.book.asks : company.book.bids;
  let possible=0, value=0;
  for (const order of book) {
    if (limit!==null && (side === "buy" ? order.price>limit : order.price<limit)) break;
    const amount=Math.min(qty-possible,order.quantity); possible+=amount; value+=amount*order.price;
    if(possible===qty) break;
  }
  if (possible<qty) return {ok:false,reason:"The order cannot be fully filled at this price."};
  if (side === "buy" && value>state.cash) return {ok:false,reason:"Not enough cash for this order."};
  const current=state.holdings[company.ticker]||0;
  const projected=side === "buy" ? current+qty : current-qty;
  if (projected<0 && !featureUnlocked("short")) return {ok:false,reason:"Short selling unlocks at $112,500 net worth or day 25."};
  if (projected<0 && shortExposureAfter(company,projected)>accountEquity()*1.25) return {ok:false,reason:"Short position exceeds your margin limit."};
  const result=fillMarketOrder(company,side,qty);
  applyPositionChange(company,side,qty,result.average);
  state.cash += side === "buy" ? -result.value : result.value;
  addLedger(`${side === "buy" ? "Bought" : current>=qty ? "Sold" : "Sold short"} ${qty} ${company.ticker} @ ${money.format(result.average)}`,side === "buy" ? -result.value : result.value);
  message(`${side === "buy" ? "Bought" : "Sold"} ${qty} ${company.ticker} at an average ${money.format(result.average)}.`,true);
  seedBook(company);
  if(renderAfter) render();
  return {ok:true};
}

function applyPositionChange(company,side,qty,price) {
  const ticker=company.ticker, current=state.holdings[ticker]||0, next=side === "buy" ? current+qty : current-qty, average=state.averageCost[ticker]||0;
  if (current===0 || Math.sign(current)===Math.sign(next) && Math.abs(next)>Math.abs(current)) {
    const added=Math.abs(next)-Math.abs(current);
    state.averageCost[ticker]=((average*Math.abs(current))+(price*added))/Math.abs(next);
  } else if (next!==0 && Math.sign(current)!==Math.sign(next)) {
    state.averageCost[ticker]=price;
  }
  state.holdings[ticker]=next;
  if (!next) { delete state.holdings[ticker]; delete state.averageCost[ticker]; }
}

function shortExposureAfter(company,projected) {
  return companies.reduce((sum,c)=>sum+(c===company?Math.max(0,-projected):Math.max(0,-(state.holdings[c.ticker]||0)))*c.price,0);
}

function addLedger(text,amount) {
  state.ledger.unshift({day:state.day,text,amount});
  state.ledger=state.ledger.slice(0,12);
}

const marketLinks = {
  NOVA:[{ticker:"AXIS",weight:.28,label:"distribution demand"},{ticker:"MEDI",weight:.16,label:"innovation spillover"},{ticker:"HARB",weight:-.08,label:"capital rotation"}],
  GRNW:[{ticker:"AXIS",weight:-.22,label:"fuel-cost pressure"},{ticker:"NOVA",weight:.10,label:"lower energy costs"},{ticker:"HARB",weight:.06,label:"input-cost relief"}],
  HARB:[{ticker:"AXIS",weight:.24,label:"freight volumes"},{ticker:"NOVA",weight:.08,label:"consumer confidence"}],
  AXIS:[{ticker:"NOVA",weight:.18,label:"supply-chain capacity"},{ticker:"HARB",weight:.20,label:"distribution capacity"},{ticker:"MEDI",weight:.12,label:"specialist logistics"}],
  MEDI:[{ticker:"NOVA",weight:.14,label:"technology demand"},{ticker:"AXIS",weight:.08,label:"specialist freight"},{ticker:"HARB",weight:-.05,label:"defensive rotation"}]
};
const events = [
  {text:"wins a major government contract",impact:.10,type:"demand"},{text:"reports stronger-than-expected demand",impact:.07,type:"demand"},{text:"launches a promising new product",impact:.06,type:"innovation"},
  {text:"faces a regulatory investigation",impact:-.11,type:"regulation"},{text:"warns of rising input costs",impact:-.07,type:"cost"},{text:"loses a key customer",impact:-.09,type:"demand"},
  {text:"announces a share buyback",impact:.05,type:"capital"},{text:"issues new shares to fund expansion",impact:-.04,type:"capital"}
];

function applyMarketEvent(company,event) {
  company.price=Math.max(2,company.price*(1+event.impact));
  const effects=(marketLinks[company.ticker]||[]).map(link=>{
    const target=companies.find(c=>c.ticker===link.ticker);
    const impact=Math.max(-.04,Math.min(.04,event.impact*link.weight));
    target.price=Math.max(2,target.price*(1+impact));
    return {ticker:target.ticker,impact,label:link.label};
  });
  const e=state.economy, confidenceShift=event.impact*18;
  e.confidence=Math.max(55,Math.min(135,e.confidence+confidenceShift));
  let rateShift=0;
  if(event.type==="cost"){e.inflation=Math.min(.09,e.inflation+Math.abs(event.impact)*.025);rateShift=Math.abs(event.impact)*.008;}
  if(event.type==="demand"){e.growth=Math.max(-.04,Math.min(.065,e.growth+event.impact*.012));rateShift=event.impact*.003;}
  if(event.type==="regulation") e.growth=Math.max(-.04,e.growth+event.impact*.006);
  e.interestRate=Math.max(.005,Math.min(.11,e.interestRate+rateShift));
  state.marketRipples.unshift({day:state.day,source:company.ticker,headline:event.text,impact:event.impact,effects,rateShift});
  state.marketRipples=state.marketRipples.slice(0,6);
  state.news.unshift({day:state.day,text:`${company.name} ${event.text}. Ripple effects reached ${effects.map(x=>x.ticker).join(", ")}.`,impact:event.impact,ticker:company.ticker});
  state.news=state.news.slice(0,6);
}

function advanceDay(renderAfter=true) {
  if (state.gameOver) return false;
  state.dayStartEquity=accountEquity();
  state.day++;
  updateEconomy();
  updateTakeoverMarket();
  runPlayerCompany(companies[0]);
  companies.forEach(c => {
    c.previous=c.price;
    if (c.ticker!=="NOVA") updateAiCompany(c);
    accrueQuarter(c);
    const dilutionFactor=c.totalShares?1000000/c.totalShares:1;
    const rateMultiple=Math.max(9,20-state.economy.interestRate*120);
    const cyclePremium=1+(state.economy.growth-.02)*c.cycleSensitivity*5;
    const inflationDrag=1-Math.max(0,state.economy.inflation-.025)*c.inflationSensitivity*2;
    const fairPrice=Math.max(4,c.profit*rateMultiple/10*dilutionFactor*cyclePremium*inflationDrag);
    const fundamentalPull=(fairPrice/c.price-1)*.006;
    const random=(Math.random()-.5)*2*c.volatility;
    c.price=Math.max(2,c.price*(1+fundamentalPull+random+c.growth/365));
  });
  runInstitutionalTraders();
  if (state.day%60===0) releaseQuarterlyReports();
  if (Math.random()<.48) {
    const c=companies[Math.floor(Math.random()*companies.length)], event=events[Math.floor(Math.random()*events.length)];
    applyMarketEvent(c,event);
  }
  companies.forEach(c=>{ c.history.push(c.price); if(c.history.length>60)c.history.shift(); seedBook(c); });
  processOpenOrders();
  settleExpiredOptions();
  if (state.day%60===0) payDividends();
  checkCampaignState();
  checkProgression();
  state.equityHistory.push(accountEquity());
  state.equityHistory=state.equityHistory.slice(-60);
  if (renderAfter) render();
  return !state.gameOver;
}

function optionUnitPrice(company,type,strike,days) {
  const intrinsic=type==="call"?Math.max(0,company.price-strike):Math.max(0,strike-company.price);
  const timeFraction=Math.sqrt(Math.max(0,days)/240);
  const timeValue=company.price*company.volatility*3.2*timeFraction;
  const rateValue=type==="call"?company.price*state.economy.interestRate*days/240*.15:0;
  return Math.max(.05,intrinsic+timeValue+rateValue);
}

function buyOption() {
  if (!featureUnlocked("options")) return optionMessage("Options unlock at $125,000 net worth or day 50.",false);
  const company=companies[state.selected],type=state.optionType,strike=+document.querySelector("#option-strike").value,days=+document.querySelect×­=êÚ$z{-®éÜj×$æ÷fÖ&¶WB6&R"Ç7B2æÖ&¶WE6&RÆ2æÖ&¶WE6&Sã×2çF&vWE6&RÆF&vWBG·7B2çF&vWE6&RÖÒÀ¢²$6ö×çÆVFG"ÆBG¶2æ6ö×ç66çFôfVB"ÖÖÆ2æ6ö×ç66ãÂ%7F&÷fRC%ÒÀ¢²%f÷Fær6öçG&öÂ"Ç7Bf÷Fæt÷væW'6Æ46öçG&öÂÂ$¶VW&÷fRSR%Ð¢Ó°¢Fö7VÖVçBçVW'6VÆV7F÷""6ö&¦V7FfRÖÆ7B"æææW$DÔÃÖö&¦V7FfW2æÖóÓæÆFb6Æ73Ò&ö&¦V7FfR#ãÇ7ãâG¶õ³×ÒfÖFF÷C²G¶õ³5×ÓÂ÷7ããÇ7G&öær6Æ73Ò"G¶õ³%Óò'W#¢&F÷vâ'Ò#âG¶õ³×ÓÂ÷7G&öæsãÂöFcææ¦öâ""°¢Fö7VÖVçBçVW'6VÆV7F÷""6æWBÖF"æF6&ÆVC×7FFRævÖT÷fW#°¢Fö7VÖVçBçVW'6VÆV7F÷""6æWB×vVV²"æF6&ÆVC×7FFRævÖT÷fW#°¢Fö7VÖVçBçVW'6VÆV7F÷""6æWBÖÖöçF"æF6&ÆVC×7FFRævÖT÷fW#°§Ð ¦gVæ7Föâ&VæFW$V6öæö×°¢6öç7BS×7FFRæV6öæö×°¢Fö7VÖVçBçVW'6VÆV7F÷""6V6öæöÖ2×&VvÖR"çFWD6öçFVçCÖRç&VvÖS°¢6öç7B÷6FfSÖRæw&÷wFãbfRæ6öæfFVæ6SãÓbfRææfÆFöãÂãS°¢Fö7VÖVçBçVW'6VÆV7F÷""6V6öæö×Ö÷WFÆöö²"çFWD6öçFVçC×÷6FfSò%&6²WFFRVÇF#¦Ræw&÷wFÃò$FVfVç6fR6öæFFöç2#¢$ÖVB6öæFFöç2#°¢Fö7VÖVçBçVW'6VÆV7F÷""6V6öæö×Ö÷WFÆöö²"æ6Æ74æÖS×÷6FfSò'W#¦Ræw&÷wFÃò&F÷vâ#¢"#°¢6öç7BfÇVW3Õ°¢²%öÆ7&FR"Ç7BRæçFW&W7E&FRÆRæçFW&W7E&FSÂãeÒÀ¢²$æfÆFöâ"Ç7BRææfÆFöâÆRææfÆFöãÂãEÒÀ¢²$tEw&÷wF"Ç7BRæw&÷wFÆRæw&÷wFãÒÀ¢²$6öæfFVæ6R"ÆRæ6öæfFVæ6RçFôfVBÆRæ6öæfFVæ6SãÓÒÀ¢²$gVVÂæFW"ÆRægVVÄæFWçFôfVBÆRægVVÄæFWÃ#Ð¢Ó°¢Fö7VÖVçBçVW'6VÆV7F÷""6V6öæö×Ö·2"æææW$DÔÃ×fÇVW2æÖcÓæÆFcãÇ7ãâG·e³×ÓÂ÷7ããÇ7G&öær6Æ73Ò"G·e³%Óò'W#¢&F÷vâ'Ò#âG·e³×ÓÂ÷7G&öæsãÂöFcææ¦öâ""°¢Fö7VÖVçBçVW'6VÆV7F÷""6Ö&¶WB×&ÆW2"æææW$DÔÃ×7FFRæÖ&¶WE&ÆW2æÆVæwF÷7FFRæÖ&¶WE&ÆW2ç6Æ6RÃ2æÖ&ÆSÓç°¢6öç7BVffV7G3×&ÆRæVffV7G2æÖVffV7CÓæÇ7â6Æ73Ò"G¶VffV7Bæ×7CãÓò'W#¢&F÷vâ'Ò#âG¶VffV7BçF6¶W'ÒG·7BVffV7Bæ×7BÓÂ÷7ãææ¦öâ""°¢6öç7B&FW3×&ÆRç&FU6gCöÇ7â6Æ73Ò"G·&ÆRç&FU6gCãò&F÷vâ#¢'W'Ò#å&FW2G·7B&ÆRç&FU6gBÓÂ÷7ãæ¢"#°¢&WGW&âÆ'F6ÆR6Æ73Ò'&ÆRÖ6&B#ãÆVFW#ãÇ7G&öær6Æ73Ò"G·&ÆRæ×7CãÓò'W#¢&F÷vâ'Ò#âG·&ÆRç6÷W&6WÒG·7B&ÆRæ×7BÓÂ÷7G&öæsãÇFÖSäDG·&ÆRæFÓÂ÷FÖSãÂöVFW#ãÇâG·&ÆRæVFÆæWÓÂ÷ãÆFb6Æ73Ò'&ÆRÖVffV7G2#âG¶VffV7G7ÒG·&FW7ÓÂöFcãÂö'F6ÆSæ°¢Òæ¦öâ""¦Ç7GÆSÒ&6öÆ÷#§f"ÒÖ×WFVB#ä6ö×ç6ö6·2æBFV"6V6öæF'Ö&¶WBVffV7G2vÆÂV"W&RãÂ÷æ°§Ð ¦gVæ7Föâ&VæFW$7FfG°¢Fö7VÖVçBçVW'6VÆV7F÷""6÷VâÖ÷&FW'2"æææW$DÔÃ×7FFRæ÷Vä÷&FW'2æÆVæwF¢ò7FFRæ÷Vä÷&FW'2æÖóÓæÆFb6Æ73Ò&7FfG×&÷r#ãÇ7ããÇ7G&öæsâG¶òçF6¶W'ÓÂ÷7G&öæsãÇ6ÖÆÃâG¶òç6FRçFõWW$66RÒÄÔCÂ÷6ÖÆÃãÂ÷7ããÇ7ãâG¶òçVçFGÒ6&W3Â÷7ããÇ7ãâG¶ÖöæWæf÷&ÖBòæÆÖBÓÂ÷7ããÆ'WGFöâFFÖ6æ6VÂÖ÷&FW#Ò"G¶òæGÒ#ä6æ6VÃÂö'WGFöããÂöFcææ¦öâ""¢¢Ç7GÆSÒ'FFæs£G¶6öÆ÷#§f"ÒÖ×WFVB#äæò÷VâÆÖB÷&FW'2ãÂ÷æ°¢Fö7VÖVçBçVW'6VÆV7F÷$ÆÂ%¶FFÖ6æ6VÂÖ÷&FW%Ò"æf÷$V6'WGFöãÓæ'WGFöâæöæ6Æ6³ÒÓç°¢7FFRæ÷Vä÷&FW'3×7FFRæ÷Vä÷&FW'2æfÇFW"÷&FW#Óæ÷&FW"æBÓÒ¶'WGFöâæFF6WBæ6æ6VÄ÷&FW"°¢FDÆVFvW"$6æ6VÆVBÆÖB÷&FW""Ã²&VæFW"°¢Ò°¢Fö7VÖVçBçVW'6VÆV7F÷""6ÆVFvW""æææW$DÔÃ×7FFRæÆVFvW"æÆVæwF¢ò7FFRæÆVFvW"æÖFVÓÓæÆFb6Æ73Ò&ÆVFvW"×&÷r#ãÇFÖSäDG¶FVÒæFÓÂ÷FÖSãÇ7ãâG¶FVÒçFWGÓÂ÷7ããÇ7â6Æ73Ò"G¶FVÒæÖ÷VçCãò'W#¦FVÒæÖ÷VçCÃò&F÷vâ#¢"'Ò#âG¶FVÒæÖ÷VçCöÖöæWæf÷&ÖBFVÒæÖ÷VçB¢"'ÓÂ÷7ããÂöFcææ¦öâ""¢¢Ç7GÆSÒ'FFæs£G¶6öÆ÷#§f"ÒÖ×WFVB#åG&FW2ÂFfFVæG2ÂæB÷&FW"7FfGvÆÂV"W&RãÂ÷æ°§Ð ¦gVæ7Föâ&VæFW$÷W&Föç2°¢6öç7B3Ö6ö×æW5³ÒÂ6VÆV7FVCÖ2ç&öGV7G5·7FFRç6VÆV7FVE&öGV7EÓòæ7FfSö2ç&öGV7G5·7FFRç6VÆV7FVE&öGV7EÓ¦2ç&öGV7G2æfæBÓçæ7FfRÂ6VÆV7FVDæFWÖ2ç&öGV7G2ææFWöb6VÆV7FVB°¢7FFRç6VÆV7FVE&öGV7C×6VÆV7FVDæFW°¢6öç7BVæFæsÖ2çVæFætFV66öç3òç&öGV7DæFWÓÓ×6VÆV7FVDæFWö2çVæFætFV66öç3¦çVÆÃ°¢6öç7B&öGV7C×VæFæsòç&öGV7GÇÇ6VÆV7FVC°¢6öç7B6öçG&öÇ3×²'&öGV7B×&6R#§&öGV7Bç&6RÂ'&öGV7Föâ#§&öGV7Bç&öGV7FöâÂ&Ö&¶WFær#§&öGV7BæÖ&¶WFærÂ'&W6V&6#§VæFæsòç&W6V&6óö2ç&W6V&6Ó°¢ö&¦V7BæVçG&W26öçG&öÇ2æf÷$V6¶BÇfÇVUÒÓç¶6öç7BçWCÖFö7VÖVçBçVW'6VÆV7F÷"2G¶GÖ¶bFö7VÖVçBæ7FfTVÆVÖVçBÓÖçWBçWBçfÇVS×fÇVS·Ò°¢Fö7VÖVçBçVW'6VÆV7F÷""67FfR×&öGV7BÖæÖR"çFWD6öçFVçCÖÖæværG·6VÆV7FVBææÖWÒÒG·6VÆV7FVBç6VvÖVçGÒ6VvÖVçF°¢&Vg&W6FV66öäÆ&VÇ2fÇ6R°¢6öç7B7FfU&öGV7FöãÖ2ç&öGV7G2æfÇFW"Óçæ7FfRç&VGV6R7VÒÇÓç7VÒ·ç&öGV7FöâÃ°¢6öç7BfÇVW3Õ°¢²$6ö×ç66"ÆBG¶2æ6ö×ç66çFôfVB"ÖÖÆ2æ6ö×ç66ãÓUÒÀ¢²%VæG26öÆB"Æ2æFÇ6ÆW2çFôÆö6ÆU7G&ærÆ2æFÇ6ÆW3ãÖ7FfU&öGV7Föâ¢ãÒÀ¢²$çfVçF÷'"Æ2æçfVçF÷'çFôÆö6ÆU7G&ærÆ2æçfVçF÷'ÃSÒÀ¢²$FÇ&öfB"ÆG¶2æFÇ÷W&Fæu&öfCãÓò"²#¢"'ÒBG¶2æFÇ÷W&Fæu&öfBçFôfVB"ÖÖÆ2æFÇ÷W&Fæu&öfCãÓÒÀ¢²%÷'FföÆòVÆG"ÆG´ÖFç&÷VæB2çVÆG£ÒòsVÆ2çVÆGãÓÒÀ¢²$Ö&¶WB6&R"Ç7B2æÖ&¶WE6&RÆ2æÖ&¶WE6&SãÒãUÐ¢Ó°¢Fö7VÖVçBçVW'6VÆV7F÷""6÷W&Föç2Ö·2"æææW$DÔÃ×fÇVW2æÖcÓæÆFcãÇ7ãâG·e³×ÓÂ÷7ããÇ7G&öær6Æ73Ò"G·e³%Óò'W#¢&F÷vâ'Ò#âG·e³×ÓÂ÷7G&öæsãÂöFcææ¦öâ""°¢ÆWBGf6SÒ$÷W&Föç2&R&Ææ6VBâ#°¢b2æçfVçF÷'ãSGf6SÒ$çfVçF÷'2ÆærWâ&VGV6R&öGV7Föâ÷"Æ÷vW"FR&öGV7B&6Râ#°¢VÇ6Rb2æFÇ6ÆW3ãbb2æçfVçF÷'Ã3Gf6SÒ$FVÖæB2÷WG'Vææær7WÇâæ7&V6R&öGV7Föâ÷"FW7BvW"&6Râ#°¢VÇ6Rb2æFÇ÷W&Fæu&öfCÃGf6SÒ%FR6ö×ç2Æ÷6ærÖöæWâ&WfWr&öGV7FöâæBF67&WFöæ''VFvWG2â#°¢VÇ6Rb2æ6ö×ç66ÃRGf6SÒ$662FvBâ&÷FV7BÆVFG&Vf÷&RgVæFærvw&W76fRw&÷wFâ#°¢Fö7VÖVçBçVW'6VÆV7F÷""6ÖævVÖVçBÖGf6R"çFWD6öçFVçCÖGf6S°¢Fö7VÖVçBçVW'6VÆV7F÷""6ÇÖFV66öç2"æF6&ÆVCÒ46öçG&öÂ°¢&VæFW%&öGV7G2°§Ð ¦gVæ7Föâ&VæFW%&öGV7G2°¢6öç7B3Ö6ö×æW5³Ó°¢Fö7VÖVçBçVW'6VÆV7F÷""7&öGV7BÖÆ7B"æææW$DÔÃÖ2ç&öGV7G2æÖ&öGV7BÆæFWÓç°¢b&öGV7Bæ7FfR&WGW&âÆ'F6ÆR6Æ73Ò'&öGV7BÖ6&B#ãÆVFW#ãÆFcãÆ3âG·&öGV7BææÖWÓÂö3ãÇ7ãâG·&öGV7Bç6VvÖVçGÒ6VvÖVçCÂ÷7ããÂöFcãÇ7G&öæsäÄô4´TCÂ÷7G&öæsãÂöVFW#ãÇäÆVæ66÷7C¢BG·&öGV7BæÆVæ66÷7GÖÒâæFÂVæB6÷7C¢G¶ÖöæWæf÷&ÖB&öGV7BçVæD6÷7BÒãÂ÷ãÆ'WGFöâFFÖÆVæ6×&öGV7CÒ"G¶æFWÒ"G²46öçG&öÂò&F6&ÆVB#¢"'ÓäÆVæ6G·&öGV7BææÖWÓÂö'WGFöããÂö'F6ÆSæ°¢6öç7B&6Tv×&öGV7Bç&6R÷&öGV7Bæ6ö×WFF÷%&6RÓ°¢&WGW&âÆ'F6ÆR6Æ73Ò'&öGV7BÖ6&BG¶æFWÓÓ×7FFRç6VÆV7FVE&öGV7Cò'6VÆV7FVB#¢"'Ò#ãÆVFW#ãÆFcãÆ3âG·&öGV7BææÖWÓÂö3ãÇ7ãâG·&öGV7Bç6VvÖVçGÒ6VvÖVçCÂ÷7ããÂöFcãÇ7G&öær6Æ73Ò"G·&6TvÃÓò'W#¢&F÷vâ'Ò#âG·&6TvÃÓò%dÅTR#¢%$TÔTÒ'ÓÂ÷7G&öæsãÂöVFW#ãÆFb6Æ73Ò'&öGV7B×7FG2#ãÇ7ãäæ÷f&6SÇ7G&öæsâG¶ÖöæWæf÷&ÖB&öGV7Bç&6RÓÂ÷7G&öæsãÂ÷7ããÇ7ãä6ö×WFF÷#Ç7G&öæsâG¶ÖöæWæf÷&ÖB&öGV7Bæ6ö×WFF÷%&6RÓÂ÷7G&öæsãÂ÷7ããÇ7ãäFÇ6ÆW3Ç7G&öæsâG·&öGV7BæFÇ6ÆW2çFôÆö6ÆU7G&ærÓÂ÷7G&öæsãÂ÷7ããÇ7ãäçfVçF÷'Ç7G&öæsâG·&öGV7BæçfVçF÷'çFôÆö6ÆU7G&ærÓÂ÷7G&öæsãÂ÷7ããÇ7ãåVÆGÇ7G&öæsâG´ÖFç&÷VæB&öGV7BçVÆG£ÒòsSÂ÷7G&öæsãÂ÷7ããÇ7ãåVæB6÷7CÇ7G&öæsâG¶ÖöæWæf÷&ÖB&öGV7BçVæD6÷7BÓÂ÷7G&öæsãÂ÷7ããÂöFcãÆ'WGFöâFF×6VÆV7B×&öGV7CÒ"G¶æFWÒ#âG¶æFWÓÓ×7FFRç6VÆV7FVE&öGV7Cò$7W'&VçFÇÖævær#¢$ÖævR&öGV7B'ÓÂö'WGFöããÂö'F6ÆSæ°¢Òæ¦öâ""°¢Fö7VÖVçBçVW'6VÆV7F÷$ÆÂ%¶FF×6VÆV7B×&öGV7EÒ"æf÷$V6'WGFöãÓæ'WGFöâæöæ6Æ6³ÒÓç·7FFRç6VÆV7FVE&öGV7CÒ¶'WGFöâæFF6WBç6VÆV7E&öGV7C·&VæFW"·Ò°¢Fö7VÖVçBçVW'6VÆV7F÷$ÆÂ%¶FFÖÆVæ6×&öGV7EÒ"æf÷$V6'WGFöãÓæ'WGFöâæöæ6Æ6³ÒÓæÆVæ6&öGV7B¶'WGFöâæFF6WBæÆVæ6&öGV7B°§Ð ¦gVæ7Föâ&VæFW$fææ6R°¢6öç7B3Ö6ö×æW5³ÒÂ÷væW'6×f÷Fæt÷væW'6Â6öçG&öÆÆVCÖ46öçG&öÂ°¢6öç7BV&Æ56&W3Ö2çF÷FÅ6&W2Ö2æf÷VæFW%6&W3°¢Fö7VÖVçBçVW'6VÆV7F÷""66öçG&öÂ×7FGW2"çFWD6öçFVçCÖ6öçG&öÆÆVCò$&ö&B6öçG&öÆÆVB#¢$6öçG&öÂÆ÷7B#°¢Fö7VÖVçBçVW'6VÆV7F÷""66öçG&öÂ×7FGW2"æ6Æ74æÖSÖ6öçG&öÆÆVCò'W#¢&F÷vâ#°¢6öç7BfÇVW3Õ°¢²%f÷Fær÷væW'6"Ç7B÷væW'6Æ6öçG&öÆÆVEÒÀ¢²$f÷VæFW"6&W2"Æ2æf÷VæFW%6&W2çFôÆö6ÆU7G&ærÇG'VUÒÀ¢²%÷'FföÆòf÷FW2"ÄÖFæÖÇ7FFRæöÆFæw5¶2çF6¶W%×ÇÃçFôÆö6ÆU7G&ærÇG'VUÒÀ¢²%6&W2÷WG7FæFær"Æ2çF÷FÅ6&W2çFôÆö6ÆU7G&ærÆ2çF÷FÅ6&W3ÃÓÒÀ¢²%V&Æ26&W2"ÇV&Æ56&W2çFôÆö6ÆU7G&ærÇG'VUÒÀ¢²$&öæBFV'B"ÆBG¶2æ&öæDFV'BçFôfVBÖÖÆ2æ&öæDFV'CÃ#ÒÀ¢²$fW&vR6÷Wöâ"Ç7B2æ&öæE&FRÆ2æ&öæE&FSÂãuÒÀ¢²$FÇçFW&W7B"ÆBG¶2æFÇçFW&W7BçFôfVB2ÖÖÆ2æFÇçFW&W7CÂãUÒÀ¢²$6ö×ç66"ÆBG¶2æ6ö×ç66çFôfVB"ÖÖÆ2æ6ö×ç66ãÓUÐ¢Å²%7G&FVv276WG2"ÆBG¶7V6Föä76WEfÇVRçFôfVB"ÖÖÆ7V6Föä76WEfÇVRãÐ¢Ó°¢Fö7VÖVçBçVW'6VÆV7F÷""6fææ6RÖ·2"æææW$DÔÃ×fÇVW2æÖcÓæÆFcãÇ7ãâG·e³×ÓÂ÷7ããÇ7G&öær6Æ73Ò"G·e³%Óò'W#¢&F÷vâ'Ò#âG·e³×ÓÂ÷7G&öæsãÂöFcææ¦öâ""°¢Fö7VÖVçBçVW'6VÆV7F÷$ÆÂ%¶FFÖfææ6RÖ7FöåÒ"æf÷$V6'WGFöãÓæ'WGFöâæF6&ÆVCÒ6öçG&öÆÆVB°¢b6öçG&öÆÆVBbbFö7VÖVçBçVW'6VÆV7F÷""6fææ6RÖÖW76vR"çFWD6öçFVçBfææ6TÖW76vR$'WFFFöæÂæ÷f6&W2âFRÖ&¶WBFò&V'VÆBÖ¦÷&Gf÷Fær7F¶Râ"ÆfÇ6R°§Ð ¦gVæ7Föâ&VæFW%F¶V÷fW'2°¢6öç7B7æW&vW3×°¢u$ås¢$VæW&wçFVw&FöâÆ÷vW'2Æöær×'Vâ÷W&Fær&6²â"À¢$#¢%&WFÂF7G&'WFöâ7G&VæwFVç26öç7VÖW"&V6â"À¢3¢$÷væVBÆöv7F72×&÷fW27WÇÖ6âVff6Væ7â"À¢ÔTD¢%&W6V&6WW'F6R66VÆW&FW2&öGV7BVÆGvç2â ¢Ó°¢Fö7VÖVçBçVW'6VÆV7F÷""7F¶V÷fW"×7FGW2"çFWD6öçFVçCÖfVGW&UVæÆö6¶VB&Ö"ò7FFRçF¶V÷fW$æ÷F6WÇÂ$æò7FfRF¶V÷fW"6×vâ"¢$Äô4´TBÒ&V6CCV²÷"F#°¢Fö7VÖVçBçVW'6VÆV7F÷""7F¶V÷fW"×F&vWG2"æææW$DÔÃÖ6ö×æW2ç6Æ6RæÖF&vWCÓç°¢6öç7B6÷7C×F¶V÷fW$&Æö6´6÷7BF&vWBÂ6VÆÅfÇVS×F&vWBç&6R§F&vWBçF÷FÅ6&W2ó¢ã¢ãS°¢&WGW&âÆ'F6ÆR6Æ73Ò'F¶V÷fW"Ö6&B#à¢ÆVFW#ãÆFcãÆ3âG·F&vWBææÖWÓÂö3ãÇ7ãâG·F&vWBçF6¶W'ÒfÖFF÷C²G·F&vWBç6V7F÷'ÓÂ÷7ããÂöFcãÇ7G&öær6Æ73Ò"G·F&vWBæ6öçG&öÆÆVCò'W#¢"'Ò#âG·F&vWBæ6öçG&öÆÆVCò%5T%4D%#¢$äDUTäDTåB'ÓÂ÷7G&öæsãÂöVFW#à¢ÆFb6Æ73Ò'7F¶RÖ&"#ãÆ7GÆSÒ'vGF¢G·F&vWBææ÷f7F¶R£#ÒR#ãÂöãÂöFcà¢ÆFb6Æ73Ò'F¶V÷fW"ÖÖWF#ãÇ7ãäæ÷f7F¶SÇ7G&öæsâG·7BF&vWBææ÷f7F¶RÓÂ÷7G&öæsãÂ÷7ããÇ7ãäFVfVç6R&VÖVÓÇ7G&öæsâG·7BF&vWBçF¶V÷fW$FVfVç6RÓÂ÷7G&öæsãÂ÷7ããÇ7ãäæWBSÇ7G&öæsâG¶ÖöæWæf÷&ÖB6÷7B£ÓÂ÷7G&öæsãÂ÷7ããÂöFcà¢ÆFb6Æ73Ò'F¶V÷fW"Ö7Föç2#ãÆ'WGFöâFFÖ'W×F&vWCÒ"G·F&vWBçF6¶W'Ò"G·F&vWBæ6öçG&öÆÆVGÇÂ46öçG&öÂÇÂfVGW&UVæÆö6¶VB&Ö"ò&F6&ÆVB#¢"'Óä'WSÂö'WGFöããÆ'WGFöâFF×6VÆÂ×F&vWCÒ"G·F&vWBçF6¶W'Ò"G·F&vWBææ÷f7F¶SÂãò&F6&ÆVB#¢"'Óå6VÆÂRG¶ÖöæWæf÷&ÖB6VÆÅfÇVR£ÒÂö'WGFöããÂöFcà¢ÇâG·7æW&vW5·F&vWBçF6¶W%×ÓÂ÷à¢Âö'F6ÆSæ°¢Òæ¦öâ""°¢Fö7VÖVçBçVW'6VÆV7F÷$ÆÂ%¶FFÖ'W×F&vWEÒ"æf÷$V6'WGFöãÓæ'WGFöâæöæ6Æ6³ÒÓæ'WF¶V÷fW$&Æö6²'WGFöâæFF6WBæ'WF&vWB°¢Fö7VÖVçBçVW'6VÆV7F÷$ÆÂ%¶FF×6VÆÂ×F&vWEÒ"æf÷$V6'WGFöãÓæ'WGFöâæöæ6Æ6³ÒÓç6VÆÅF¶V÷fW$&Æö6²'WGFöâæFF6WBç6VÆÅF&vWB°§Ð ¦gVæ7Föâ&Vg&W6FV66öäÆ&VÇ2Ö&´F'G×G'VR°¢Fö7VÖVçBçVW'6VÆV7F÷""7&öGV7B×&6R×fÇVR"çFWD6öçFVçCÖÖöæWæf÷&ÖB¶Fö7VÖVçBçVW'6VÆV7F÷""7&öGV7B×&6R"çfÇVR°¢Fö7VÖVçBçVW'6VÆV7F÷""7&öGV7Föâ×fÇVR"çFWD6öçFVçCÖG²¶Fö7VÖVçBçVW'6VÆV7F÷""7&öGV7Föâ"çfÇVRçFôÆö6ÆU7G&ærÒVæG6°¢Fö7VÖVçBçVW'6VÆV7F÷""6Ö&¶WFær×fÇVR"çFWD6öçFVçCÖBG¶Fö7VÖVçBçVW'6VÆV7F÷""6Ö&¶WFær"çfÇVWÖ²öF°¢Fö7VÖVçBçVW'6VÆV7F÷""7&W6V&6×fÇVR"çFWD6öçFVçCÖBG¶Fö7VÖVçBçVW'6VÆV7F÷""7&W6V&6"çfÇVWÖ²öF°¢bÖ&´F'GFö7VÖVçBçVW'6VÆV7F÷""6÷W&Föç2×7FGW2"çFWD6öçFVçCÒ%Vç6fVB6ævW2#°§Ð ¦gVæ7FöâWFFTW7FÖFR°¢6öç7B3Ö6ö×æW5·7FFRç6VÆV7FVEÒÇGÔÖFæÖÂ¶Fö7VÖVçBçVW'6VÆV7F÷""7VçFG"çfÇVWÇÃ°¢b7FFRæ÷&FW%GSÓÓÒ&ÆÖB"°¢6öç7BÆÖCÒ¶Fö7VÖVçBçVW'6VÆV7F÷""6ÆÖB×&6R"çfÇVWÇÆ2ç&6S°¢Fö7VÖVçBçVW'6VÆV7F÷""6W7FÖFR"çFWD6öçFVçCÖÖöæWæf÷&ÖBG¦ÆÖB°¢Fö7VÖVçBçVW'6VÆV7F÷""7G&FR"çFWD6öçFVçCÖÆ6RG·7FFRç6FWÒÆÖB÷&FW&°¢&WGW&ã°¢Ð¢6öç7B&öö³×7FFRç6FSÓÓÒ&'W#ö2æ&öö²æ6·3¦2æ&öö²æ&G3¶ÆWBÆVgC×GÇF÷FÃÓ°¢f÷"6öç7Bòöb&öö²¶6öç7BãÔÖFæÖâÆVgBÆòçVçFG·F÷FÂ³Öâ¦òç&6S¶ÆVgBÓÖã¶bÆVgB'&V³·Ð¢Fö7VÖVçBçVW'6VÆV7F÷""6W7FÖFR"çFWD6öçFVçCÖÆVgCò$ç7Vff6VçBÆVFG#¦ÖöæWæf÷&ÖBF÷FÂ°¢Fö7VÖVçBçVW'6VÆV7F÷""7G&FR"çFWD6öçFVçCÖG·7FFRç6FSÓÓÒ&'W#ò$'W#¢%6VÆÂ'ÒG·GÇÂ"'Ò6&W6°§Ð ¦6ö×æW2æf÷$V66VVD&öö²°¦Fö7VÖVçBçVW'6VÆV7F÷""6æWBÖF"æöæ6Æ6³ÒÓç'VäF2²Fö7VÖVçBçVW'6VÆV7F÷""6æWB×vVV²"æöæ6Æ6³ÒÓç'VäF2R²Fö7VÖVçBçVW'6VÆV7F÷""6æWBÖÖöçF"æöæ6Æ6³ÒÓç'VäF2#°¦Fö7VÖVçBçVW'6VÆV7F÷""76÷rÖGf6÷""æöæ6Æ6³ÒÓç·7FFRæGf6÷$FFVãÖfÇ6S·&VæFW"·Ó²Fö7VÖVçBçVW'6VÆV7F÷""6Gf6÷"ÖF6Ö72"æöæ6Æ6³ÒÓç·7FFRæGf6÷$FFVã×G'VS·&VæFW"·Ó²Fö7VÖVçBçVW'6VÆV7F÷""6Gf6÷"ÖæWB"æöæ6Æ6³ÖæWDGf6÷%F°¦Fö7VÖVçBçVW'6VÆV7F÷""7G&FR"æöæ6Æ6³ÖWV7WFUG&FS²Fö7VÖVçBçVW'6VÆV7F÷""7VçFG"æöæçWC×WFFTW7FÖFS²Fö7VÖVçBçVW'6VÆV7F÷""6ÆÖB×&6R"æöæçWC×WFFTW7FÖFS°¦Fö7VÖVçBçVW'6VÆV7F÷""6'WÖ÷Föâ"æöæ6Æ6³Ö'W÷Föã²Fö7VÖVçBçVW'6VÆV7F÷""6÷Föâ×7G&¶R"æöæ6ævS×&VæFW#²Fö7VÖVçBçVW'6VÆV7F÷""6÷FöâÖW'"æöæ6ævS×&VæFW#²Fö7VÖVçBçVW'6VÆV7F÷""6÷FöâÖ6öçG&7G2"æöæçWC×&VæFW#°¦Fö7VÖVçBçVW'6VÆV7F÷$ÆÂ%¶FFÖ÷Föâ×GUÒ"æf÷$V6'WGFöãÓæ'WGFöâæöæ6Æ6³ÒÓç·7FFRæ÷FöåGSÖ'WGFöâæFF6WBæ÷FöåGS¶Fö7VÖVçBçVW'6VÆV7F÷$ÆÂ%¶FFÖ÷Föâ×GUÒ"æf÷$V6#Óæ"æ6Æ74Æ7BçFövvÆR&7FfR"Æ#ÓÓÖ'WGFöâ·&VæFW"·Ò°¦Fö7VÖVçBçVW'6VÆV7F÷""76fRÖvÖR"æöæ6Æ6³×6fTvÖS²Fö7VÖVçBçVW'6VÆV7F÷""6ÆöBÖvÖR"æöæ6Æ6³ÖÆöDvÖS²Fö7VÖVçBçVW'6VÆV7F÷""6æWrÖvÖR"æöæ6Æ6³ÖæWtvÖS²Fö7VÖVçBçVW'6VÆV7F÷""6ÖöFÂÖ'WGFöâ"æöæ6Æ6³ÖæWtvÖS°¦Fö7VÖVçBçVW'6VÆV7F÷""6Fff7VÇG"æöæ6ævSÒÓç¶b7FFRæFãÖW76vR$Fff7VÇGÆW2vVâ÷R7F'BæWrvÖRâ"ÆfÇ6R·Ó°¦Fö7VÖVçBçVW'6VÆV7F÷$ÆÂ%¶FF×6FUÒ"æf÷$V6'WGFöãÓæ'WGFöâæöæ6Æ6³ÒÓç·7FFRç6FSÖ'WGFöâæFF6WBç6FS¶Fö7VÖVçBçVW'6VÆV7F÷$ÆÂ%¶FF×6FUÒ"æf÷$V6#Óæ"æ6Æ74Æ7BçFövvÆR&7FfR"Æ#ÓÓÖ'WGFöâ¶'WGFöâç&VçDVÆVÖVçBæ6Æ74Æ7BçFövvÆR'6VÆÂ"Ç7FFRç6FSÓÓÒ'6VÆÂ"·WFFTW7FÖFR·Ò°¦Fö7VÖVçBçVW'6VÆV7F÷$ÆÂ%¶FFÖ÷&FW"×GUÒ"æf÷$V6'WGFöãÓæ'WGFöâæöæ6Æ6³ÒÓç°¢7FFRæ÷&FW%GSÖ'WGFöâæFF6WBæ÷&FW%GS°¢Fö7VÖVçBçVW'6VÆV7F÷$ÆÂ%¶FFÖ÷&FW"×GUÒ"æf÷$V6#Óæ"æ6Æ74Æ7BçFövvÆR&7FfR"Æ#ÓÓÖ'WGFöâ°¢Fö7VÖVçBçVW'6VÆV7F÷""6ÆÖB×&6RÖÆ&VÂ"æ6Æ74Æ7BçFövvÆR&FFVâ"Ç7FFRæ÷&FW%GRÓÒ&ÆÖB"°¢b7FFRæ÷&FW%GSÓÓÒ&ÆÖB"Fö7VÖVçBçVW'6VÆV7F÷""6ÆÖB×&6R"çfÇVSÖ6ö×æW5·7FFRç6VÆV7FVEÒç&6RçFôfVB"°¢WFFTW7FÖFR°§Ò°¦Fö7VÖVçBçVW'6VÆV7F÷""6ÇÖFV66öç2"æöæ6Æ6³ÖÇÖævVÖVçDFV66öç3°¥²ââæFö7VÖVçBçVW'6VÆV7F÷$ÆÂ%¶FFÖfææ6RÖ7FöåÒ"Òæf÷$V6'WGFöãÓæ'WGFöâæöæ6Æ6³ÒÓæ6÷'÷&FTfææ6T7Föâ'WGFöâæFF6WBæfææ6T7Föâ°¥²'&öGV7B×&6R"Â'&öGV7Föâ"Â&Ö&¶WFær"Â'&W6V&6%Òæf÷$V6CÓæFö7VÖVçBçVW'6VÆV7F÷"2G¶GÖæöæçWCÒÓç&Vg&W6FV66öäÆ&VÇ2°§væF÷ræFDWfVçDÆ7FVæW"'&W6¦R"ÂÓç&VæFW$6'B6ö×æW5·7FFRç6VÆV7FVEÒ²&VæFW"°