"use strict";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const companies = [
  { ticker:"NOVA", name:"Nova Devices", sector:"Consumer Technology", price:48.20, revenue:820, profit:74, debt:190, growth:.12, volatility:.035, dividendYield:.012, cycleSensitivity:1.25, inflationSensitivity:.7 },
  { ticker:"GRNW", name:"Greenway Energy", sector:"Renewable Energy", price:31.60, revenue:510, profit:39, debt:240, growth:.18, volatility:.045, dividendYield:.008, cycleSensitivity:.9, inflationSensitivity:.45 },
  { ticker:"HARB", name:"Harbor Foods", sector:"Consumer Staples", price:62.10, revenue:1120, profit:96, debt:120, growth:.05, volatility:.018, dividendYield:.032, cycleSensitivity:.3, inflationSensitivity:.8 },
  { ticker:"AXIS", name:"Axis Logistics", sector:"Transportation", price:25.80, revenue:680, profit:42, debt:310, growth:.08, volatility:.03, dividendYield:.021, cycleSensitivity:1.05, inflationSensitivity:1.2 },
  { ticker:"MEDI", name:"Mediora Labs", sector:"Healthcare", price:79.40, revenue:390, profit:51, debt:85, growth:.22, volatility:.055, dividendYield:0, cycleSensitivity:.4, inflationSensitivity:.35 },
  { ticker:"BRIK", name:"Brickwell Materials", sector:"Building Materials", price:18.70, revenue:460, profit:31, debt:180, growth:.06, volatility:.026, dividendYield:.018, cycleSensitivity:1.15, inflationSensitivity:1.05 },
  { ticker:"FASH", name:"Urban Loom", sector:"Apparel Retail", price:37.25, revenue:740, profit:45, debt:95, growth:.11, volatility:.038, dividendYield:.01, cycleSensitivity:.95, inflationSensitivity:.75 },
  { ticker:"FOAM", name:"Foam & Furnish", sector:"Home Goods", price:44.80, revenue:610, profit:48, debt:135, growth:.09, volatility:.032, dividendYield:.014, cycleSensitivity:1.1, inflationSensitivity:.9 },
  { ticker:"BYTE", name:"ByteMart Online", sector:"E-Commerce", price:91.40, revenue:980, profit:68, debt:260, growth:.19, volatility:.052, dividendYield:0, cycleSensitivity:1.25, inflationSensitivity:.5 },
  { ticker:"AGRI", name:"AgriNorth Foods", sector:"Agriculture", price:28.90, revenue:530, profit:37, debt:115, growth:.045, volatility:.024, dividendYield:.026, cycleSensitivity:.45, inflationSensitivity:1.1 }
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
  customerSatisfaction:72,
  brandScore:68,
  totalShares:1000000,
  founderShares:750000,
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
  mode:"guided",
  holdings:{}, averageCost:{}, news:[], openOrders:[], ledger:[],
  economy:{interestRate:.04,inflation:.025,confidence:100,growth:.022,fuelIndex:100,regime:"Steady expansion"},
  difficulty:"normal", gameOver:false, takeoverNotice:"No active takeover campaign", selectedProduct:0,
  advisorStep:0, advisorHidden:false, optionType:"call", optionPositions:[],
  aiFunds:createAiFunds(), institutionActivity:[], marketRipples:[], unlockedMilestones:["basic","limit","short","options","ma"],
  equityHistory:[100000], dayStartEquity:100000,
  player:{name:"Founder",companyName:"Nova Devices",avatar:"founder-a",logo:"logo-a"},
  facilities:[],
  selectedFacilityId:null,
  missions:{selected:"save-nova", completed:[], profitableDays:0, lastProfitDay:0, priceAdjusted:false, productionAdjusted:false, marketingAdjusted:false, researchAdjusted:false},
  autoTime:{running:false,speed:1,accumulator:0}
};
const SAVE_KEY="market-foundry-save-v5";
const SAVE_PROFILE_KEY="market-foundry-save-profile-v1";
const MODE_KEY="market-foundry-mode";
const TRADING_DAYS_PER_YEAR=240;
const CAMPAIGN_YEARS=10;
const CAMPAIGN_DAYS=TRADING_DAYS_PER_YEAR*CAMPAIGN_YEARS;
const PUBLIC_SITE_URL="https://robertmarkmagic.github.io/";
const initialCompanies=JSON.parse(JSON.stringify(companies));
const initialState=JSON.parse(JSON.stringify(state));
let orderId = 0;
let supabaseClient = null;
let currentUser = null;
let audioContext = null;
let audioEnabled = false;
const runtime = { lastFrame:0, fps:60, frames:0, fpsTime:0, touchStart:null, lastAutoSave:0 };
const guideState = { productClass:"food", product:"bread" };
const facilityBlueprints = {
  factory:{name:"Factory",cost:12,capacity:140,role:"Produces finished goods"},
  store:{name:"Retail Store",cost:7,capacity:90,role:"Sells finished goods to consumers"},
  industry:{name:"Raw-material Industry",cost:10,capacity:120,role:"Produces raw materials"},
  gasStation:{name:"Gas Station",cost:8,capacity:115,role:"Sells fuel, snacks, and travel essentials"},
  bakery:{name:"Bakery",cost:6,capacity:105,role:"Sells fresh baked goods"},
  pharmacy:{name:"Pharmacy",cost:9,capacity:95,role:"Sells medicine and personal-care products"},
  electronicsShop:{name:"Electronics Shop",cost:10,capacity:75,role:"Sells consumer electronics"},
  fashionShop:{name:"Fashion Shop",cost:8,capacity:90,role:"Sells apparel and accessories"},
  groceryShop:{name:"Grocery Shop",cost:9,capacity:130,role:"Sells everyday food and drinks"},
  homeShop:{name:"Home Goods Shop",cost:8,capacity:85,role:"Sells household products"},
  petShop:{name:"Pet Shop",cost:6,capacity:80,role:"Sells pet supplies"},
  jewelryShop:{name:"Jewelry Shop",cost:11,capacity:45,role:"Sells high-margin luxury goods"},
  bookShop:{name:"Book Shop",cost:5,capacity:70,role:"Sells books and media"},
  carWash:{name:"Car Wash",cost:5,capacity:100,role:"Provides consumer services"}
};
const productLines = {
  bricks:{name:"Bricks",raw:"clay",input:"Clay",output:"Bricks",unitCost:14,unitPrice:38,market:110},
  bread:{name:"Bread",raw:"grain",input:"Grain",output:"Bread",unitCost:6,unitPrice:15,market:180},
  shirts:{name:"Shirts",raw:"fabric",input:"Fabric",output:"Shirts",unitCost:11,unitPrice:32,market:130},
  phones:{name:"Phones",raw:"components",input:"Components",output:"Phones",unitCost:120,unitPrice:310,market:55},
  fuel:{name:"Fuel",raw:"oil",input:"Crude oil",output:"Fuel",unitCost:42,unitPrice:92,market:170},
  coffee:{name:"Coffee",raw:"beans",input:"Coffee beans",output:"Coffee",unitCost:9,unitPrice:24,market:150},
  pastries:{name:"Pastries",raw:"flour",input:"Flour",output:"Pastries",unitCost:5,unitPrice:16,market:145},
  cheese:{name:"Cheese",raw:"milk",input:"Milk",output:"Cheese",unitCost:12,unitPrice:31,market:105},
  softDrinks:{name:"Soft Drinks",raw:"syrup",input:"Drink syrup",output:"Soft drinks",unitCost:7,unitPrice:21,market:165},
  cosmetics:{name:"Cosmetics",raw:"chemicals",input:"Cosmetic compounds",output:"Cosmetics",unitCost:22,unitPrice:68,market:95},
  medicine:{name:"Medicine",raw:"pharma",input:"Pharma ingredients",output:"Medicine",unitCost:35,unitPrice:118,market:80},
  computers:{name:"Computers",raw:"chips",input:"Microchips",output:"Computers",unitCost:210,unitPrice:520,market:45},
  printers:{name:"Printers",raw:"components",input:"Components",output:"Printers",unitCost:86,unitPrice:230,market:58},
  appliances:{name:"Appliances",raw:"steel",input:"Steel",output:"Appliances",unitCost:130,unitPrice:340,market:52},
  luxuryCars:{name:"Luxury Cars",raw:"autoParts",input:"Auto parts",output:"Luxury cars",unitCost:1800,unitPrice:4200,market:14},
  motorcycles:{name:"Motorcycles",raw:"autoParts",input:"Auto parts",output:"Motorcycles",unitCost:620,unitPrice:1450,market:22},
  babyClothes:{name:"Baby Clothes",raw:"cotton",input:"Cotton",output:"Baby clothes",unitCost:10,unitPrice:29,market:116},
  leatherJackets:{name:"Leather Jackets",raw:"leather",input:"Leather",output:"Leather jackets",unitCost:46,unitPrice:135,market:62},
  petFood:{name:"Pet Food",raw:"grain",input:"Grain",output:"Pet food",unitCost:8,unitPrice:24,market:120},
  books:{name:"Books",raw:"paper",input:"Paper",output:"Books",unitCost:9,unitPrice:26,market:88},
  jewelry:{name:"Jewelry",raw:"preciousMetals",input:"Precious metals",output:"Jewelry",unitCost:180,unitPrice:520,market:28},
  cleaningGoods:{name:"Cleaning Goods",raw:"chemicals",input:"Chemicals",output:"Cleaning goods",unitCost:8,unitPrice:25,market:125}
};
const productClasses = [
  {id:"food",name:"Food & Bakery",items:["bread","coffee","pastries","cheese","softDrinks","petFood"]},
  {id:"fashion",name:"Apparel",items:["shirts","babyClothes","leatherJackets"]},
  {id:"electronics",name:"Computer & Electronics",items:["phones","computers","printers","appliances"]},
  {id:"vehicles",name:"Vehicles",items:["luxuryCars","motorcycles"]},
  {id:"health",name:"Health & Body Care",items:["medicine","cosmetics","cleaningGoods"]},
  {id:"construction",name:"Building Materials",items:["bricks"]},
  {id:"energy",name:"Energy",items:["fuel"]},
  {id:"media",name:"Books & Luxury",items:["books","jewelry"]}
];
const progressionMilestones = [
  {id:"basic",name:"Cash Trader",description:"Market buy and sell orders",worth:0,day:1},
  {id:"limit",name:"Order Specialist",description:"Limit orders and patient execution",worth:105000,day:10},
  {id:"short",name:"Margin License",description:"Short selling under an equity limit",worth:112500,day:25},
  {id:"options",name:"Derivatives Desk",description:"Calls, puts, and expiry management",worth:125000,day:50},
  {id:"ma",name:"Deal Maker",description:"Strategic stakes and corporate takeovers",worth:145000,day:90}
];

const learningMissions = [
  {id:"save-nova",title:"Save Nova Devices",description:"Survive the first week, keep company cash positive, and produce at least one profitable operating day.",reward:"Learn the basic survival loop.",unlock:"Dashboard + Operations + Advisor"},
  {id:"right-price",title:"Find the Right Price",description:"Move the product price and create healthy customer demand without drowning Nova in inventory.",reward:"Practice pricing and demand.",unlock:"Operations deep dive"},
  {id:"control-production",title:"Control Production",description:"Adjust daily production so inventory is useful, not wasteful. You want stock available, but not a warehouse full of dead cash.",reward:"Practice production discipline.",unlock:"Production discipline"},
  {id:"smart-marketing",title:"Market Without Burning Cash",description:"Use marketing to lift demand while keeping Nova profitable. Good growth should not bankrupt the company.",reward:"Practice profitable growth.",unlock:"Reports"},
  {id:"first-report",title:"Read Your First Report",description:"Review the business pulse: revenue, cost, profit, cash, inventory, demand, satisfaction, and brand strength.",reward:"Learn how reports explain business quality.",unlock:"Market + Trading + Portfolio"},
  {id:"unlock-market",title:"Make Your First Trade",description:"Buy one listed stock so you can see how a portfolio moves beside your operating business.",reward:"Practice portfolio basics.",unlock:"Empire"},
  {id:"supply-chain",title:"Build Your First Supply Chain",description:"Build a facility or improve one. Learn how inputs, output, capacity, and marketing create an operating business.",reward:"Practice supply-chain building.",unlock:"Founder Empire"},
  {id:"build-empire",title:"Build Your Empire",description:"Run at least two active business assets: a second facility, a second product line, or a larger upgraded operation.",reward:"Practice advanced expansion.",unlock:"Finance + Options + M&A"}
];

function featureUnlocked(id) {
  return true;
}

function checkProgression() {
  state.unlockedMilestones=progressionMilestones.map(milestone=>milestone.id);
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
  if (state.orderType !== "market") {
    if (!featureUnlocked("limit")) return message("Limit orders unlock at $105,000 net worth or day 10.",false);
    const usesLimit=state.orderType==="limit"||state.orderType==="stop-limit",usesStop=state.orderType==="stop"||state.orderType==="stop-limit";
    const limit=+document.querySelector("#limit-price").value,stop=+document.querySelector("#stop-price").value;
    if (usesLimit && !(limit>0)) return message("Enter a valid limit price.",false);
    if (usesStop && !(stop>0)) return message("Enter a valid stop trigger.",false);
    const order={id:orderId++,ticker:company.ticker,side:state.side,quantity:qty,type:state.orderType,limit:usesLimit?+limit.toFixed(2):null,stop:usesStop?+stop.toFixed(2):null,triggered:state.orderType==="limit",day:state.day};
    state.openOrders.push(order);
    addLedger(`Placed ${state.side} ${state.orderType} order for ${qty} ${company.ticker}`,0);
    const details=[order.stop?`stop ${money.format(order.stop)}`:"",order.limit?`limit ${money.format(order.limit)}`:""].filter(Boolean).join(", ");
    message(`${state.orderType} order placed at ${details}.`,true);
    playCue("order");
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
  if (possible<=0) return {ok:false,reason:"No market liquidity is available for this order."};
  if (side === "buy" && value>state.cash) {
    possible=0; value=0;
    for (const order of book) {
      if (limit!==null && order.price>limit) break;
      const affordable=Math.floor((state.cash-value)/order.price);
      const amount=Math.min(qty-possible,order.quantity,affordable);
      if (amount<=0) break;
      possible+=amount; value+=amount*order.price;
      if(possible===qty) break;
    }
    if (possible<=0) return {ok:false,reason:"Not enough cash for this order."};
  }
  const current=state.holdings[company.ticker]||0;
  if (possible<qty) qty=possible;
  const projected=side === "buy" ? current+qty : current-qty;
  if (projected<0 && !featureUnlocked("short")) return {ok:false,reason:"Short selling unlocks at $112,500 net worth or day 25."};
  if (projected<0 && shortExposureAfter(company,projected)>accountEquity()*1.25) return {ok:false,reason:"Short position exceeds your margin limit."};
  const result=fillMarketOrder(company,side,qty);
  applyPositionChange(company,side,qty,result.average);
  state.cash += side === "buy" ? -result.value : result.value;
  addLedger(`${side === "buy" ? "Bought" : current>=qty ? "Sold" : "Sold short"} ${qty} ${company.ticker} @ ${money.format(result.average)}`,side === "buy" ? -result.value : result.value);
  message(`${side === "buy" ? "Bought" : "Sold"} ${qty} ${company.ticker} at an average ${money.format(result.average)}.`,true);
  showExecutionToast(`${side === "buy" ? "BUY" : "SELL"} ${qty} ${company.ticker} filled at ${money.format(result.average)}`);
  playCue(side === "buy" ? "buy" : "sell");
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

let toastTimer;
function showExecutionToast(text) {
  const toast=document.querySelector("#execution-toast");
  toast.querySelector("span").textContent=text;
  toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.add("hidden"),2200);
}

function ensureAudio() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function playCue(type="click") {
  if (!audioEnabled) return;
  const ctx=ensureAudio(), now=ctx.currentTime, gain=ctx.createGain(), osc=ctx.createOscillator();
  const tones={click:[520,.035],order:[660,.055],buy:[880,.08],sell:[360,.08],day:[520,.06],error:[140,.12],win:[740,.14]};
  const [freq,length]=tones[type]||tones.click;
  osc.type=type==="error"?"sawtooth":"square";
  osc.frequency.setValueAtTime(freq,now);
  if (type==="buy" || type==="win") osc.frequency.exponentialRampToValueAtTime(freq*1.5,now+length);
  if (type==="sell" || type==="error") osc.frequency.exponentialRampToValueAtTime(Math.max(80,freq*.7),now+length);
  gain.gain.setValueAtTime(.0001,now);
  gain.gain.exponentialRampToValueAtTime(.06,now+.01);
  gain.gain.exponentialRampToValueAtTime(.0001,now+length);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now); osc.stop(now+length+.02);
}

function toggleAudio() {
  audioEnabled=!audioEnabled;
  ensureAudio();
  const button=document.querySelector("#audio-toggle");
  button.textContent=audioEnabled?"Sound on":"Sound off";
  button.setAttribute("aria-pressed",audioEnabled?"true":"false");
  playCue("win");
}

const tutorialSteps=[
  {selector:"#dashboard",title:"Welcome to Market Foundry",text:"You are free to play from the start. The dashboard shows net worth, daily movement, positions, optional tasks, and the health of Nova Devices."},
  {selector:".mission-card",title:"Optional task board",text:"Use the challenge dropdown to pick a task. Tasks do not lock the game; they are goals that teach systems and reward you with clear progress."},
  {selector:"#operations",title:"Run Nova Devices",text:"This is your first company. Change price, production, marketing, and research, then apply decisions. The preview shows expected demand, production, profit, and inventory."},
  {selector:"#operations",title:"Read the business signals",text:"Watch company cash, units sold, inventory, profit, customer satisfaction, brand score, and market share. These tell you if the business is healthy."},
  {selector:"#market",title:"Market heatmap",text:"All stocks are open immediately. Green firms rose today, red firms fell. Click a company to inspect its price, fundamentals, and order book."},
  {selector:"#trading",title:"Trading terminal",text:"Place market, limit, stop, and stop-limit orders from the beginning. Buy shares, sell shares, or use shorts carefully if you want more risk."},
  {selector:"#portfolio-section",title:"Portfolio and news",text:"Your positions and the news feed explain why your wealth changes. Compare your stock portfolio with Nova's operating performance."},
  {selector:".financial-reports",title:"Financial reports",text:"Reports show revenue, profit, cash, debt, estimates, and earnings surprises. Use them to understand whether share-price moves are justified."},
  {selector:"#empire",title:"Founder Empire",text:"Build industries, factories, and stores. Industries create inputs, factories make products, and stores sell goods. The Manufacturer's Guide explains recipes."},
  {selector:"#finance",title:"Corporate finance",text:"Use bonds, share issues, repayments, and buybacks to fund Nova. Debt protects ownership but creates interest cost; shares raise cash but dilute control."},
  {selector:"#deals",title:"Deals and takeovers",text:"Acquire strategic stakes in rival companies. At majority control they become subsidiaries and can add synergies to your business."},
  {selector:".clock",title:"Let time run",text:"Use +1 day, +1 week, +1 month, or Start time with speed controls. Time advances operations, market prices, reports, dividends, news, and AI fund activity."}
];
let tutorialIndex=0;
function beginTutorial() {
  tutorialIndex=0;
  document.querySelector("#tutorial-overlay").classList.remove("hidden");
  renderTutorial();
}
function renderTutorial() {
  document.querySelectorAll(".tutorial-focus").forEach(el=>el.classList.remove("tutorial-focus"));
  const step=tutorialSteps[tutorialIndex], target=document.querySelector(step.selector);
  document.querySelector("#tutorial-kicker").textContent="STARTUP GUIDE "+(tutorialIndex+1)+" / "+tutorialSteps.length;
  document.querySelector("#tutorial-title").textContent=step.title;
  document.querySelector("#tutorial-text").textContent=step.text;
  document.querySelector("#tutorial-next").textContent=tutorialIndex===tutorialSteps.length-1?"Finish":"Next";
  if (target) { target.classList.add("tutorial-focus"); target.scrollIntoView({behavior:"smooth",block:"center"}); }
}
function finishTutorial() {
  document.querySelectorAll(".tutorial-focus").forEach(el=>el.classList.remove("tutorial-focus"));
  document.querySelector("#tutorial-overlay").classList.add("hidden");
}
function nextTutorialStep() {
  if (tutorialIndex>=tutorialSteps.length-1) return finishTutorial();
  tutorialIndex++; renderTutorial();
}

function ensureStateDefaults() {
  if (!state.mode || state.mode==="open") state.mode="guided";
  if (!state.player) state.player={name:"Founder",companyName:"Nova Devices",avatar:"founder-a",logo:"logo-a"};
  if (!Array.isArray(state.facilities)) state.facilities=[];
  if (!state.selectedFacilityId && state.facilities[0]) state.selectedFacilityId=state.facilities[0].id;
  if (state.selectedFacilityId && !state.facilities.some(f=>f.id===state.selectedFacilityId)) state.selectedFacilityId=state.facilities[0]?.id || null;
  if (!state.autoTime) state.autoTime={running:false,speed:1,accumulator:0};
  ensureMissionDefaults();
  if (companies[0].founderShares<750000 && state.day===1) companies[0].founderShares=750000;
}

function openLaunchModal() {
  document.querySelector("#launch-modal").classList.remove("hidden");
  document.querySelector("#launch-load").disabled=!localStorage.getItem(SAVE_KEY);
  updateLocalSaveStatus();
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
  runFacilities();
  runPlayerCompany(companies[0]);
  updateMissionProgress();
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
  autoSaveLocal("advance-day");
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
  const company=companies[state.selected],type=state.optionType,strike=+document.querySelector("#option-strike").value,days=+document.querySelector("#option-expiry").value,contracts=Math.max(1,Math.floor(+document.querySelector("#option-contracts").value||1));
  const unitPremium=optionUnitPrice(company,type,strike,days),cost=unitPremium*100*contracts;
  if (cost>state.cash) return optionMessage("Not enough account cash for this premium.",false);
  state.cash-=cost;
  state.optionPositions.push({id:orderId++,ticker:company.ticker,type,strike,expiryDay:state.day+days,contracts,entryPremium:unitPremium});
  addLedger(`Bought ${contracts} ${company.ticker} ${type} option${contracts>1?"s":""}`, -cost);
  optionMessage(`Purchased for ${money.format(cost)}. Maximum loss is the premium.`,true); render();
}

function optionPositionValue(position) {
  const company=companies.find(c=>c.ticker===position.ticker),days=Math.max(0,position.expiryDay-state.day);
  return optionUnitPrice(company,position.type,position.strike,days)*100*position.contracts;
}

function sellOptionPosition(id) {
  const index=state.optionPositions.findIndex(p=>p.id===id);
  if (index<0) return;
  const position=state.optionPositions[index],value=optionPositionValue(position);
  state.cash+=value; state.optionPositions.splice(index,1);
  addLedger(`Closed ${position.ticker} ${position.type} options`,value); render();
}

function settleExpiredOptions() {
  const active=[];
  for (const position of state.optionPositions) {
    if (position.expiryDay>state.day) { active.push(position); continue; }
    const company=companies.find(c=>c.ticker===position.ticker);
    const intrinsic=position.type==="call"?Math.max(0,company.price-position.strike):Math.max(0,position.strike-company.price);
    const settlement=intrinsic*100*position.contracts;
    state.cash+=settlement;
    addLedger(`${position.ticker} ${position.type} expired${settlement?" in the money":" worthless"}`,settlement);
  }
  state.optionPositions=active;
}

function optionMessage(text,good) { const el=document.querySelector("#option-message");el.textContent=text;el.className=good?"up":"down"; }

function accrueQuarter(company) {
  const revenue=company.ticker==="NOVA"?company.dailyRevenue:company.revenue/240*(.96+Math.random()*.08);
  const profit=company.ticker==="NOVA"?company.dailyOperatingProfit:company.profit/240*(.92+Math.random()*.16);
  company.quarterlyRevenue+=revenue;
  company.quarterlyProfit+=profit;
}

function releaseQuarterlyReports() {
  const quarter=Math.ceil(state.day/60);
  companies.forEach(company=>{
    const revenue=company.quarterlyRevenue,profit=company.quarterlyProfit;
    const revenueSurprise=(revenue-company.analystRevenue)/Math.max(1,Math.abs(company.analystRevenue));
    const profitSurprise=(profit-company.analystProfit)/Math.max(1,Math.abs(company.analystProfit));
    const combined=Math.max(-.25,Math.min(.25,revenueSurprise*.35+profitSurprise*.65));
    const cash=company.ticker==="NOVA"?company.companyCash:Math.max(5,company.profit*.35-company.debt*.03);
    const report={quarter,revenue,profit,revenueEstimate:company.analystRevenue,profitEstimate:company.analystProfit,revenueSurprise,profitSurprise,margin:revenue?profit/revenue:0,cash,debt:company.debt,combined};
    company.reports.unshift(report); company.reports=company.reports.slice(0,8);
    company.price=Math.max(2,company.price*(1+combined*.45));
    company.analystRevenue=Math.max(1,revenue*(1+company.growth/4)*(.98+Math.random()*.04));
    company.analystProfit=Math.max(.1,profit*(1+company.growth/4)*(.94+Math.random()*.12));
    company.quarterlyRevenue=0; company.quarterlyProfit=0;
    const result=combined>.025?"beat expectations":combined<-.025?"missed expectations":"reported in line";
    state.news.unshift({day:state.day,text:`${company.name} ${result} for Q${quarter}.`,impact:combined,ticker:company.ticker});
  });
  state.news=state.news.slice(0,6);
}

function runDays(days) {
  for (let i=0;i<days;i++) {
    if (!advanceDay(false)) break;
  }
  playCue("day");
  render();
}

function facilityLabel(facility) {
  return `${facilityBlueprints[facility.type].name} - ${productLines[facility.line].name}`;
}

function facilityRole(type) {
  if (type==="industry") return "industry";
  if (type==="factory") return "factory";
  return "store";
}

function playerBrandMarkup(compact=false) {
  const player=state.player||{};
  const mode=state.mode==="expert"?"Expert Mode":"Guided Mode";
  return `<div class="player-brand ${compact?"compact":""}">
    <i class="avatar-chip ${player.avatar||"founder-a"}"></i>
    <i class="logo-chip ${player.logo||"logo-a"}"></i>
    <div><strong>${player.companyName||"Nova Devices"}</strong><span>${player.name||"Founder"} &middot; ${mode}</span></div>
  </div>`;
}

function renderPlayerBrand() {
  const card=document.querySelector("#player-brand-card");
  if (card) card.innerHTML=playerBrandMarkup(false);
}

function facilityMarketMetrics(facility) {
  const line=productLines[facility.line], role=facilityRole(facility.type), settings=difficultySettings();
  const capacity=facilityBlueprints[facility.type].capacity*facility.level;
  // GAME BALANCE TUNING:
  // These facility economics make factories/stores readable before time advances.
  // Adjust competitorBase, marketingLift, and costPressure here when balancing the Empire loop.
  const competitorBase=line.unitPrice*(.94+((state.day+facility.id)%17)/100);
  const competitorPrice=Math.max(line.unitCost*1.35,competitorBase);
  const priceAppeal=clamp((competitorPrice/Math.max(1,line.unitPrice))**settings.priceSensitivity,.45,1.65);
  const marketingLift=1+Math.sqrt(facility.marketing/50)*settings.marketingEfficiency;
  const macro=clamp(state.economy.confidence/100*(1+(state.economy.growth-.02)*2),.55,1.35);
  const demand=Math.max(0,Math.round(line.market*priceAppeal*marketingLift*macro*settings.demandMultiplier));
  const unitCost=line.unitCost*settings.costPressure;
  const grossMargin=(line.unitPrice-unitCost)/Math.max(1,line.unitPrice);
  const stock=role==="industry"?facility.rawInventory:facility.finishedInventory;
  const marketingCost=facility.marketing*1000;
  const contribution=Math.max(1,line.unitPrice-unitCost);
  const breakEvenUnits=Math.ceil(marketingCost/contribution);
  const possibleUnits=role==="store"?Math.min(stock,capacity,demand):Math.min(capacity,demand);
  const estimatedProfit=(possibleUnits*line.unitPrice-possibleUnits*unitCost-marketingCost)/1000000;
  const capacityUse=capacity?clamp((facility.lastUnits||0)/capacity,0,1):0;
  return {line,role,capacity,competitorPrice,demand,unitCost,grossMargin,stock,breakEvenUnits,estimatedProfit,capacityUse,possibleUnits};
}

function facilityAdvice(metrics) {
  if (metrics.role==="store" && metrics.stock<metrics.demand*.35) return "Demand is higher than your store inventory. Build or upgrade a factory feeding this product line.";
  if (metrics.line.unitPrice>metrics.competitorPrice*1.08) return "Your selling price is above the competitor. A premium can work, but demand will be harder to win.";
  if (metrics.grossMargin<.22) return "Margin is thin. Consider upgrades, a stronger supply chain, or selling a higher-margin product.";
  if (metrics.capacityUse>.9) return "This facility is close to full capacity. Upgrade it if demand keeps growing.";
  if (metrics.estimatedProfit<0) return "The current setup looks unprofitable. Raise price, lower marketing, or improve volume before scaling.";
  return "The economics look healthy. Watch inventory and competitor price before expanding.";
}

function empireMessage(text,good) {
  const el=document.querySelector("#empire-status");
  if (el) { el.textContent=text; el.className=good?"up":"down"; }
  message(text,good);
}

function buildFacility() {
  const type=document.querySelector("#facility-type").value, line=document.querySelector("#facility-line").value;
  const blueprint=facilityBlueprints[type], company=companies[0], cost=blueprint.cost;
  if (!hasControl()) return empireMessage("You need board control to build facilities.",false);
  if (company.companyCash<cost) return empireMessage(`Nova needs $${cost}m cash to build this ${blueprint.name}.`,false);
  const role=facilityRole(type);
  const facility={id:Date.now()+Math.floor(Math.random()*1000),type,line,level:1,rawInventory:role==="industry"?0:60,finishedInventory:role==="store"?40:0,marketing:35,profit:0,lastUnits:0};
  state.facilities.push(facility);
  state.selectedFacilityId=facility.id;
  company.companyCash-=cost;
  state.news.unshift({day:state.day,ticker:"NOVA",impact:.02,text:`${state.player.companyName} opened a ${facilityLabel(facility)}.`});
  state.news=state.news.slice(0,6);
  addLedger(`Built ${facilityLabel(facility)}`,-cost*1000000);
  empireMessage(`${facilityLabel(facility)} opened. It will operate when time advances.`,true);
  playCue("win");
  render();
}

function upgradeFacility(id) {
  const facility=state.facilities.find(item=>item.id===id), company=companies[0];
  if (!facility) return;
  const cost=4+facility.level*3;
  if (company.companyCash<cost) return empireMessage(`Need $${cost}m company cash for this upgrade.`,false);
  company.companyCash-=cost; facility.level++;
  addLedger(`Upgraded ${facilityLabel(facility)}`,-cost*1000000);
  empireMessage(`${facilityLabel(facility)} upgraded to level ${facility.level}.`,true);
  render();
}

function marketFacility(id) {
  const facility=state.facilities.find(item=>item.id===id), company=companies[0];
  if (!facility) return;
  if (company.companyCash<1) return empireMessage("Need $1m company cash for a marketing push.",false);
  company.companyCash-=1; facility.marketing+=20;
  addLedger(`Marketing push: ${facilityLabel(facility)}`,-1000000);
  empireMessage(`${facilityLabel(facility)} marketing increased.`,true);
  render();
}

function sellFacility(id,demolish=false) {
  const facility=state.facilities.find(item=>item.id===id), company=companies[0];
  if (!facility) return;
  const base=facilityBlueprints[facility.type].cost, recovery=demolish ? .35 : .68;
  const value=(base+facility.level*2)*recovery;
  company.companyCash+=value;
  state.facilities=state.facilities.filter(item=>item.id!==id);
  state.selectedFacilityId=state.facilities[0]?.id || null;
  addLedger(`${demolish?"Demolished":"Sold"} ${facilityLabel(facility)}`,value*1000000);
  empireMessage(`${demolish?"Demolished":"Sold"} ${facilityLabel(facility)} for $${value.toFixed(2)}m.`,true);
  render();
}

function runFacilities() {
  if (!Array.isArray(state.facilities) || !state.facilities.length) return;
  const company=companies[0], settings=difficultySettings(), rawPool={}, finishedPool={};
  // GAME BALANCE TUNING:
  // Facilities use the same difficulty knobs as Nova operations. Easy gives
  // friendlier demand and lower cost pressure; Hard makes supply mistakes expensive.
  let profit=0, units=0, revenue=0;
  state.facilities.forEach(facility=>{
    const blueprint=facilityBlueprints[facility.type], line=productLines[facility.line], capacity=blueprint.capacity*facility.level;
    facility.profit=0; facility.lastUnits=0;
    if (facilityRole(facility.type)==="industry") {
      const made=Math.round(capacity*(.85+Math.random()*.3));
      rawPool[line.raw]=(rawPool[line.raw]||0)+made;
      facility.rawInventory+=made; facility.lastUnits=made;
      const cost=made*line.unitCost*.35*settings.costPressure/1000000;
      company.companyCash-=cost; profit-=cost;
    }
  });
  state.facilities.forEach(facility=>{
    const line=productLines[facility.line], capacity=facilityBlueprints[facility.type].capacity*facility.level;
    if (facilityRole(facility.type)==="factory") {
      const availableRaw=(rawPool[line.raw]||0)+facility.rawInventory;
      const rawUsed=Math.min(capacity,availableRaw);
      const external=Math.max(0,capacity-rawUsed);
      rawPool[line.raw]=Math.max(0,(rawPool[line.raw]||0)-rawUsed);
      facility.rawInventory=Math.max(0,facility.rawInventory-Math.max(0,rawUsed-(rawPool[line.raw]||0)));
      const made=Math.round((rawUsed+external)*(.82+Math.random()*.12));
      finishedPool[facility.line]=(finishedPool[facility.line]||0)+made;
      facility.finishedInventory+=made; facility.lastUnits=made;
      const cost=(made*line.unitCost+external*line.unitCost*.8)*settings.costPressure/1000000;
      company.companyCash-=cost; profit-=cost;
    }
  });
  state.facilities.forEach(facility=>{
    const line=productLines[facility.line], capacity=facilityBlueprints[facility.type].capacity*facility.level;
    if (facilityRole(facility.type)==="store") {
      const supply=(finishedPool[facility.line]||0)+facility.finishedInventory;
      const demand=Math.round(line.market*(1+Math.sqrt(facility.marketing/50)*settings.marketingEfficiency)*(state.economy.confidence/100)*settings.demandMultiplier*(1+(Math.random()-.5)*settings.demandRandomness*2));
      const sold=Math.min(supply,capacity,demand);
      facility.finishedInventory=Math.max(0,supply-sold);
      finishedPool[facility.line]=0;
      const sales=sold*line.unitPrice/1000000, marketing=facility.marketing/1000;
      company.companyCash+=sales-marketing; profit+=sales-marketing; revenue+=sales; units+=sold;
      facility.profit=sales-marketing; facility.lastUnits=sold;
    }
  });
  company.dailyOperatingProfit+=profit;
  company.dailyRevenue+=revenue;
  company.marketShare=Math.min(.68,company.marketShare+units/500000);
  if (profit!==0 && state.day%5===0) addLedger("Empire operations",profit*1000000);
}

function updateTakeoverMarket() {
  companies.slice(1).forEach(target=>{
    if (target.controlled) return;
    if (target.novaStake>=.2 && Math.random()<.025) {
      target.takeoverDefense=Math.min(.35,target.takeoverDefense+.05);
      state.news.unshift({day:state.day,text:`${target.name} adopted takeover defenses against Nova.`,impact:.04,ticker:target.ticker});
      state.news=state.news.slice(0,6);
    }
    target.takeoverDefense=Math.max(0,target.takeoverDefense-.0002);
  });
}

function difficultySettings() {
  return {
    // GAME BALANCE TUNING:
    // These numbers shape the core company loop. To rebalance later, start here.
    // demandMultiplier controls baseline customer demand, marketingEfficiency controls
    // how useful ad spending is, priceSensitivity controls how hard customers punish
    // high prices, and fixedOperatingCost/costPressure control survival difficulty.
    easy:{targetWorth:250000,targetShare:.25,costMultiplier:.92,volatility:.85,label:"Easy",demandMultiplier:1.12,marketingEfficiency:.21,priceSensitivity:1.18,costPressure:.92,fixedOperatingCost:.08,cashReserveRatio:.12,demandRandomness:.06,inventoryHoldingRate:.0018},
    normal:{targetWorth:500000,targetShare:.35,costMultiplier:1,volatility:1,label:"Normal",demandMultiplier:1,marketingEfficiency:.17,priceSensitivity:1.35,costPressure:1,fixedOperatingCost:.12,cashReserveRatio:.18,demandRandomness:.10,inventoryHoldingRate:.0025},
    hard:{targetWorth:1000000,targetShare:.45,costMultiplier:1.1,volatility:1.2,label:"Hard",demandMultiplier:.91,marketingEfficiency:.14,priceSensitivity:1.55,costPressure:1.08,fixedOperatingCost:.18,cashReserveRatio:.25,demandRandomness:.14,inventoryHoldingRate:.0034}
  }[state.difficulty];
}

function clamp(value,min,max) {
  return Math.max(min,Math.min(max,value));
}

function campaignScore() {
  const c=companies[0], settings=difficultySettings();
  const wealth=Math.max(0,Math.min(35,accountEquity()/settings.targetWorth*35));
  const companyHealth=Math.max(0,Math.min(20,(c.companyCash+acquisitionAssetValue())/30*12+Math.max(0,c.dailyOperatingProfit)*8));
  const share=Math.max(0,Math.min(20,c.marketShare/settings.targetShare*20));
  const control=hasControl()?15:0;
  const acquisitions=Math.min(10,controlledSubsidiaries().length*5+companies.slice(1).reduce((sum,target)=>sum+target.novaStake,0)*5);
  return Math.round(wealth+companyHealth+share+control+acquisitions);
}

function checkCampaignState() {
  const c=companies[0];
  if (accountEquity()<=0) return endGame("Personal bankruptcy","Your trading account has no remaining equity.",false);
  if (c.companyCash<=0 && c.dailyOperatingProfit<0 && c.bondDebt>=40) return endGame("Corporate bankruptcy","Nova ran out of cash while carrying unsustainable debt.",false);
  if (state.day>=CAMPAIGN_DAYS) {
    const s=difficultySettings();
    const won=accountEquity()>=s.targetWorth&&c.marketShare>=s.targetShare&&c.companyCash>0;
    endGame(won?"Ten Year Empire complete":"The board expected more",won?"You built a durable company and a serious fortune over 10 years.":"Nova survived 10 years, but one or more empire objectives were missed.",won);
  }
}

function endGame(title,body,won) {
  state.gameOver=true;
  document.querySelector("#modal-kicker").textContent=won?"CAMPAIGN COMPLETE":"CAMPAIGN ENDED";
  document.querySelector("#modal-title").textContent=title;
  document.querySelector("#modal-body").textContent=body;
  const c=companies[0];
  document.querySelector("#modal-score").innerHTML=`<div><span>Score</span><strong>${campaignScore()} / 100</strong></div><div><span>Net worth</span><strong>${money.format(accountEquity())}</strong></div><div><span>Nova cash</span><strong>$${c.companyCash.toFixed(2)}m</strong></div><div><span>Market share</span><strong>${pct(c.marketShare)}</strong></div>`;
  document.querySelector("#game-modal").classList.remove("hidden");
}

function makeSavePayload() {
  const now=new Date().toISOString();
  return {
    version:5,
    companies,
    state,
    orderId,
    savedAt:now,
    gameState:{companies,state,orderId},
    currentMode:state.mode,
    currentMission:state.missions?.selected || "save-nova",
    completedMissions:[...(state.missions?.completed || [])],
    unlockedScreens:progressionMilestones.map(milestone=>milestone.id),
    companyStats:{
      companyName:state.player?.companyName || companies[0].name,
      cash:companies[0].companyCash,
      marketShare:companies[0].marketShare,
      customerSatisfaction:companies[0].customerSatisfaction,
      brandScore:companies[0].brandScore,
      dailyProfit:companies[0].dailyOperatingProfit
    },
    playerDecisions:{
      selectedProduct:state.selectedProduct,
      products:companies[0].products.map(product=>({name:product.name,price:product.price,production:product.production,marketing:product.marketing,quality:product.quality,active:product.active})),
      facilities:state.facilities
    },
    reports:companies.map(company=>({ticker:company.ticker,reports:company.reports || []}))
  };
}

function applySavePayload(payload, label="Saved game loaded.") {
  if (!payload || payload.version!==5) throw new Error("Unsupported save version");
  restoreArray(companies,payload.companies); restoreObject(state,payload.state); orderId=payload.orderId||0;
  if (!Array.isArray(state.aiFunds)) state.aiFunds=createAiFunds();
  if (!Array.isArray(state.institutionActivity)) state.institutionActivity=[];
  if (!Array.isArray(state.marketRipples)) state.marketRipples=[];
    state.unlockedMilestones=progressionMilestones.map(milestone=>milestone.id);
    if (!Array.isArray(state.equityHistory)) state.equityHistory=[accountEquity()];
    if (!Number.isFinite(state.dayStartEquity)) state.dayStartEquity=accountEquity();
    ensureStateDefaults();
    localStorage.setItem(MODE_KEY,state.mode);
    companies.forEach(c=>{if(!c.book)c.book={bids:[],asks:[]};seedBook(c);});
  document.querySelector("#difficulty").value=state.difficulty;
  document.querySelector("#game-modal").classList.add("hidden"); document.querySelector("#launch-modal").classList.add("hidden"); message(label,true); render(); return true;
}

function saveGame() {
  try {
    const payload=makeSavePayload();
    localStorage.setItem(SAVE_KEY,JSON.stringify(payload));
    localStorage.setItem(MODE_KEY,state.mode);
    addLedger("Game saved",0);
    updateLocalSaveStatus();
    render();
    message(`Game saved locally at ${new Date(payload.savedAt).toLocaleTimeString()}.`,true);
    document.querySelector("#status-headline").textContent="Game saved locally in this browser.";
    playCue("order");
    return true;
  } catch (error) {
    const text="Save failed. Your browser may be blocking local storage.";
    message(text,false);
    document.querySelector("#status-headline").textContent=text;
    playCue("error");
    return false;
  }
}

function autoSaveLocal(reason="auto") {
  try {
    const payload=makeSavePayload();
    localStorage.setItem(SAVE_KEY,JSON.stringify(payload));
    localStorage.setItem(MODE_KEY,state.mode);
    updateLocalSaveStatus();
    return true;
  } catch {
    return false;
  }
}

function saveProfilePayload(email, companyName) {
  const now=new Date().toISOString();
  const existing=JSON.parse(localStorage.getItem(SAVE_PROFILE_KEY) || "null");
  const payload=makeSavePayload();
  // TODO: Send this exact save profile structure to Supabase/Firebase/backend
  // when online saves are implemented. For now it is stored only in localStorage.
  return {
    email:email.toLowerCase(),
    companyName,
    gameState:payload.gameState,
    currentMode:payload.currentMode,
    completedMissions:payload.completedMissions,
    unlockedScreens:payload.unlockedScreens,
    createdAt:existing?.createdAt || now,
    lastSavedAt:now
  };
}

function openSaveProfile() {
  const modal=document.querySelector("#save-profile-modal");
  const profile=JSON.parse(localStorage.getItem(SAVE_PROFILE_KEY) || "null");
  document.querySelector("#profile-email").value=profile?.email || "";
  document.querySelector("#profile-company").value=state.player?.companyName || companies[0].name || profile?.companyName || "";
  document.querySelector("#profile-status").textContent="Your game is saved locally in this browser.";
  modal.classList.remove("hidden");
}

function closeSaveProfile() {
  document.querySelector("#save-profile-modal").classList.add("hidden");
}

function saveProfileLocally() {
  const email=document.querySelector("#profile-email").value.trim();
  const companyName=(document.querySelector("#profile-company").value.trim() || state.player?.companyName || companies[0].name || "Nova Devices");
  if (!email || !email.includes("@")) {
    document.querySelector("#profile-status").textContent="Enter an email to create a save profile.";
    document.querySelector("#profile-status").className="down";
    return;
  }
  if (state.player) state.player.companyName=companyName;
  companies[0].name=companyName;
  const profile=saveProfilePayload(email,companyName);
  localStorage.setItem(SAVE_PROFILE_KEY,JSON.stringify(profile));
  localStorage.setItem(SAVE_KEY,JSON.stringify(makeSavePayload()));
  document.querySelector("#profile-status").textContent="Saved locally. Online save is coming soon. You can continue playing without saving online.";
  document.querySelector("#profile-status").className="up";
  document.querySelector("#status-headline").textContent="Your game is saved locally in this browser.";
  updateLocalSaveStatus();
  playCue("order");
}

function updateLocalSaveStatus() {
  const status=document.querySelector("#local-save-status");
  if (!status) return;
  const raw=localStorage.getItem(SAVE_KEY);
  if (!raw) {
    status.textContent="Local auto-save is ready in this browser.";
    return;
  }
  try {
    const payload=JSON.parse(raw);
    status.textContent=`Continue Local Game is available. Last local save: ${new Date(payload.savedAt).toLocaleString()}.`;
  } catch {
    status.textContent="A local save exists, but it could not be read.";
  }
}

function loadGame() {
  const raw=localStorage.getItem(SAVE_KEY);
  if (!raw) return message("No saved game was found in this browser.",false);
  try {
    const payload=JSON.parse(raw);
    return applySavePayload(payload,"Saved game loaded.");
  } catch { message("The saved game could not be loaded.",false); return false; }
}

function cloudConfig() {
  return window.MARKET_FOUNDRY_SUPABASE || {};
}

function cloudConfigured() {
  const config=cloudConfig();
  return Boolean(window.supabase && config.url && config.anonKey);
}

function cloudReady() {
  return Boolean(cloudConfigured() && supabaseClient);
}

function updateCloudStatus(text, good=null) {
  const status=document.querySelector("#cloud-status");
  if (!status) return;
  const config=cloudConfig();
  let next=text;
  if (!next) {
    if (!window.supabase) next="Cloud library could not load. Local saves still work.";
    else if (!config.url || !config.anonKey) next="Online save is coming soon. Your game is currently saved in this browser.";
    else if (currentUser) next=`Signed in as ${currentUser.email}. Cloud saves are ready.`;
    else next="Online save is coming soon. Your game is currently saved in this browser.";
  }
  status.textContent=next;
  status.className=good===null ? "" : good ? "up" : "down";
  document.querySelector("#cloud-save").disabled=false;
  document.querySelector("#cloud-load").disabled=false;
}

function explainCloudSetup() {
  const text="Email signup needs Supabase setup first. Add your Project URL and public anon key in supabase-config.js.";
  updateCloudStatus(text,false);
  document.querySelector("#status-headline").textContent=text;
  message(text,false);
  playCue("error");
}

function initCloud() {
  const config=cloudConfig();
  if (!window.supabase || !config.url || !config.anonKey) { updateCloudStatus(); return; }
  supabaseClient=window.supabase.createClient(config.url,config.anonKey);
  supabaseClient.auth.getUser().then(({data})=>{
    currentUser=data.user;
    if (currentUser && location.hash.includes("access_token")) history.replaceState(null,"",location.pathname+location.search);
    updateCloudStatus();
  });
  supabaseClient.auth.onAuthStateChange((_event,session)=>{ currentUser=session?session.user:null; updateCloudStatus(); });
}

function authFields() {
  return {
    email:document.querySelector("#profile-email")?.value.trim() || "",
    password:""
  };
}

function authRedirectUrl() {
  return PUBLIC_SITE_URL;
}

async function addEmailSubscriber(email, source="signup") {
  return null;
}

async function signUp() {
  if (!supabaseClient) return explainCloudSetup();
  const {email,password}=authFields();
  if (!email || password.length<6) return updateCloudStatus("Enter an email and a password with at least 6 characters.",false);
  const redirectTo=authRedirectUrl();
  const {error}=await supabaseClient.auth.signUp({email,password,options:{emailRedirectTo:redirectTo}});
  if (error) return updateCloudStatus(error.message,false);
  updateCloudStatus("Check your email for save-game access.",true);
}

async function resendConfirmation() {
  if (!supabaseClient) return explainCloudSetup();
  const {email}=authFields();
  if (!email) return updateCloudStatus("Enter your email first, then press Resend email.",false);
  const {error}=await supabaseClient.auth.resend({type:"signup",email,options:{emailRedirectTo:authRedirectUrl()}});
  if (error) return updateCloudStatus(error.message,false);
  updateCloudStatus("Confirmation email sent again. Check inbox and spam folder.",true);
  document.querySelector("#status-headline").textContent="Confirmation email resent.";
}

async function resetPassword() {
  if (!supabaseClient) return explainCloudSetup();
  const {email}=authFields();
  if (!email) return updateCloudStatus("Enter your email first, then press Reset password.",false);
  const {error}=await supabaseClient.auth.resetPasswordForEmail(email,{redirectTo:authRedirectUrl()});
  if (error) return updateCloudStatus(error.message,false);
  updateCloudStatus("Password reset email sent. Check inbox and spam folder.",true);
  document.querySelector("#status-headline").textContent="Password reset email sent.";
}

async function signIn() {
  if (!supabaseClient) return explainCloudSetup();
  const {email,password}=authFields();
  const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});
  if (error) return updateCloudStatus(error.message,false);
  currentUser=data.user;
  updateCloudStatus();
}

async function signOut() {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
  currentUser=null; updateCloudStatus("Signed out. Browser saves still work.");
}

async function cloudSaveGame() {
  openSaveProfile();
  message("Email is only used to save your game. You can continue playing without saving online.",true);
  // TODO: When backend save is ready, submit saveProfilePayload() to Supabase/Firebase here.
}

async function cloudLoadGame() {
  openSaveProfile();
  const text="Online save is coming soon. Your game is currently saved in this browser.";
  document.querySelector("#profile-status").textContent=text;
  document.querySelector("#profile-status").className="";
  message(text,true);
  document.querySelector("#status-headline").textContent=text;
  // TODO: When backend save is ready, recover a save profile by email here.
}

function newGame(startTutorial=false, mode="guided") {
  restoreArray(companies,initialCompanies); restoreObject(state,initialState); orderId=0;
  state.mode=mode==="expert"?"expert":"guided";
  localStorage.setItem(MODE_KEY,state.mode);
  ensureMissionDefaults();
  state.player={
    name:(document.querySelector("#founder-name")?.value||"Founder").trim()||"Founder",
    companyName:(document.querySelector("#founder-company")?.value||"Nova Devices").trim()||"Nova Devices",
    avatar:document.querySelector("#avatar-choices .active")?.dataset.avatar||"founder-a",
    logo:document.querySelector("#logo-choices .active")?.dataset.logo||"logo-a"
  };
  companies[0].name=state.player.companyName;
  companies[0].founderShares=750000;
  state.difficulty=document.querySelector("#difficulty").value;
  const settings=difficultySettings(); companies[0].unitCost*=settings.costMultiplier; companies[0].products.forEach(p=>p.unitCost*=settings.costMultiplier); companies.forEach(c=>c.volatility*=settings.volatility);
  companies.forEach(seedBook); document.querySelector("#game-modal").classList.add("hidden"); document.querySelector("#launch-modal").classList.add("hidden"); autoSaveLocal("new-game"); render(); message(`${state.mode==="expert"?"Expert Mode":"Guided Mode"} started. No email required to play. Your game is saved locally in this browser.`,true);
  playCue("win");
  if (startTutorial && state.mode==="guided") beginTutorial();
}

function restoreArray(target,source) { target.splice(0,target.length,...JSON.parse(JSON.stringify(source))); }
function restoreObject(target,source) { Object.keys(target).forEach(key=>delete target[key]); Object.assign(target,JSON.parse(JSON.stringify(source))); }

function updateAiCompany(company) {
  const e=state.economy;
  const cycle=(e.growth-.02)*company.cycleSensitivity*.06;
  const inflation=-Math.max(0,e.inflation-.025)*company.inflationSensitivity*.04;
  const fuel=company.ticker==="AXIS"?-(e.fuelIndex/100-1)*.003:0;
  const policy=company.ticker==="GRNW"&&e.inflation<.045?.0015:0;
  company.profit=Math.max(1,company.profit*(1+cycle+inflation+fuel+policy+(Math.random()-.5)*.004));
  company.revenue=Math.max(1,company.revenue*(1+cycle*.7+(Math.random()-.5)*.002));
}

function estimatedFairPrice(company) {
  const dilutionFactor=company.totalShares?1000000/company.totalShares:1;
  const rateMultiple=Math.max(9,20-state.economy.interestRate*120);
  return Math.max(4,company.profit*rateMultiple/10*dilutionFactor);
}

function institutionalScore(fund,company) {
  const fairGap=estimatedFairPrice(company)/company.price-1;
  const recent=company.history.length>5?company.price/company.history.at(-6)-1:0;
  const debtLoad=company.debt/Math.max(1,company.revenue);
  if (fund.strategy==="Value") return fairGap+company.dividendYield*2-debtLoad*.08;
  if (fund.strategy==="Momentum") return recent*2+(company.price/company.previous-1)*3;
  if (fund.strategy==="Short seller") return -(fairGap+company.growth*.2-debtLoad*.18);
  const sectorBoost=company.ticker==="GRNW"?(.045-state.economy.inflation)*2:company.ticker==="HARB"?(100-state.economy.confidence)/500:company.ticker==="AXIS"?-(state.economy.fuelIndex/100-1):state.economy.growth-.02;
  return sectorBoost+fairGap*.35;
}

function runInstitutionalTraders() {
  state.aiFunds.forEach(fund=>{
    if (Math.random()>.72) return;
    const ranked=companies.map(company=>({company,score:institutionalScore(fund,company)})).sort((a,b)=>b.score-a.score);
    let choice=ranked[0], side="buy";
    if (fund.strategy==="Short seller" || choice.score<-.025) { choice=ranked.at(-1); side="sell"; }
    const company=choice.company, held=fund.holdings[company.ticker]||0;
    if (side==="sell" && fund.strategy!=="Short seller" && held<=0) return;
    const conviction=Math.min(1,Math.abs(choice.score)*7+.15);
    let quantity=Math.max(20,Math.floor((40+Math.random()*180)*conviction));
    if (side==="buy") quantity=Math.min(quantity,Math.floor(fund.cash/company.price));
    else if (fund.strategy!=="Short seller") quantity=Math.min(quantity,held);
    if (quantity<10) return;
    const value=quantity*company.price;
    fund.cash+=side==="buy"?-value:value;
    fund.holdings[company.ticker]=held+(side==="buy"?quantity:-quantity);
    if (!fund.holdings[company.ticker]) delete fund.holdings[company.ticker];
    const pressure=Math.min(.018,quantity/12000)*(side==="buy"?1:-1);
    company.price=Math.max(2,company.price*(1+pressure));
    const activity={day:state.day,fund:fund.name,ticker:company.ticker,side,quantity,price:company.price};
    state.institutionActivity.unshift(activity);
    state.institutionActivity=state.institutionActivity.slice(0,10);
    if (quantity>=100) {
      state.news.unshift({day:state.day,ticker:company.ticker,impact:pressure,text:`${fund.name} ${side==="buy"?"accumulated":"sold"} a large ${company.ticker} position.`});
      state.news=state.news.slice(0,6);
    }
  });
}

function updateEconomy() {
  const e=state.economy;
  e.growth=Math.max(-.04,Math.min(.065,e.growth+(Math.random()-.5)*.004));
  e.inflation=Math.max(-.005,Math.min(.09,e.inflation+(Math.random()-.5)*.003+(e.growth-.025)*.015));
  const targetRate=Math.max(.005,e.inflation+.012);
  e.interestRate=Math.max(.005,Math.min(.11,e.interestRate+(targetRate-e.interestRate)*.025));
  e.confidence=Math.max(55,Math.min(135,e.confidence+(e.growth-.018)*18-(e.inflation-.03)*8+(Math.random()-.5)*2));
  e.fuelIndex=Math.max(65,Math.min(180,e.fuelIndex*(1+(Math.random()-.49)*.012+Math.max(0,e.inflation-.03)*.02)));
  const oldRegime=e.regime;
  e.regime=e.growth<-.005?"Recession":e.inflation>.055?"Inflation shock":e.growth>.04?"Economic boom":e.confidence<80?"Cautious slowdown":"Steady expansion";
  if (e.regime!==oldRegime) {
    state.news.unshift({day:state.day,text:`The economy has entered a new regime: ${e.regime}.`,impact:e.growth<0?-.04:.025,ticker:"ECONOMY"});
    state.news=state.news.slice(0,6);
  }
}

function processOpenOrders() {
  const remaining=[];
  for (const order of state.openOrders) {
    const company=companies.find(c=>c.ticker===order.ticker);
    order.type=order.type||"limit";
    if ((order.type==="stop"||order.type==="stop-limit") && !order.triggered) {
      order.triggered=order.side==="buy"?company.price>=order.stop:company.price<=order.stop;
      if (!order.triggered) { remaining.push(order); continue; }
      addLedger(`${order.ticker} ${order.type} trigger reached`,0);
    }
    if (order.type==="stop") {
      const result=executeMarketTrade(company,order.side,order.quantity,null,false);
      if (!result.ok) remaining.push(order);
      continue;
    }
    const best=order.side === "buy" ? company.book.asks[0]?.price : company.book.bids[0]?.price;
    const marketable=best!==undefined && (order.side === "buy" ? best<=order.limit : best>=order.limit);
    if (!marketable) { remaining.push(order); continue; }
    const result=executeMarketTrade(company,order.side,order.quantity,order.limit,false);
    if (!result.ok) remaining.push(order);
  }
  state.openOrders=remaining;
}

function payDividends() {
  let net=0;
  companies.forEach(company=>{
    const shares=state.holdings[company.ticker]||0;
    if (!shares || !company.dividendYield) return;
    const payment=shares*company.price*company.dividendYield/4;
    state.cash+=payment; net+=payment;
    addLedger(`${payment>=0?"Dividend received":"Dividend owed on short"}: ${company.ticker}`,payment);
  });
  if (net!==0) state.news.unshift({day:state.day,text:`Quarterly dividends changed your cash balance by ${money.format(net)}.`,impact:0,ticker:"ACCOUNT"});
}

function runPlayerCompany(company) {
  if (company.pendingDecisions) {
    const pending=company.pendingDecisions;
    Object.assign(company.products[pending.productIndex],pending.product);
    company.research=pending.research;
    company.pendingDecisions=null;
    document.querySelector("#operations-status").textContent=`Active from day ${state.day}`;
  }
  const settings=difficultySettings();
  // GAME BALANCE TUNING:
  // This is the main daily operating loop for Nova. The order is:
  // 1. estimate demand from price, marketing, quality, economy, and difficulty
  // 2. produce only what cash can support while keeping a small liquidity reserve
  // 3. sell available units, charge production/marketing/research/holding costs
  // 4. update satisfaction, brand, market share, profit, and stock fundamentals
  const macroDemand=clamp(state.economy.confidence/100*(1+(state.economy.growth-.02)*3)*settings.demandMultiplier,.5,1.45);
  const logisticsEfficiency=companies.find(c=>c.ticker==="AXIS")?.controlled ? .94 : 1;
  const energyEfficiency=companies.find(c=>c.ticker==="GRNW")?.controlled ? .97 : 1;
  const retailSynergy=companies.find(c=>c.ticker==="HARB")?.controlled ? .08 : 0;
  const activeProducts=company.products.filter(p=>p.active);
  let totalRevenue=0,totalProductionCost=0,totalMarketing=0,totalSold=0,totalInventory=0,totalDemand=0,totalHoldingCost=0,totalPotential=0;
  for (const product of activeProducts) {
    product.competitorPrice=Math.max(product.unitCost*1.25,product.competitorPrice*(1+(Math.random()-.5)*.018+state.economy.inflation/240));
    const relativePrice=product.competitorPrice/product.price;
    const priceAppeal=clamp(relativePrice**settings.priceSensitivity,.32,1.85);
    const marketingLift=1+Math.sqrt(product.marketing/100)*settings.marketingEfficiency+retailSynergy;
    const qualityLift=clamp(.72+product.quality*.28,.7,1.24);
    const demandNoise=1+(Math.random()-.5)*settings.demandRandomness*2;
    const demand=Math.max(60,Math.round(product.marketPotential*priceAppeal*marketingLift*qualityLift*macroDemand*demandNoise));
    const inflatedUnitCost=product.unitCost*(1+Math.max(-.02,state.economy.inflation)*1.35)*settings.costPressure*logisticsEfficiency*energyEfficiency;
    const discretionaryCost=(product.marketing+company.research/activeProducts.length)*1000;
    const cashReserve=company.companyCash*1000000*settings.cashReserveRatio;
    const availableCash=Math.max(0,company.companyCash*1000000-totalProductionCost*1000000-totalMarketing*1000-discretionaryCost-cashReserve);
    const produced=Math.min(product.production,Math.floor(availableCash/inflatedUnitCost));
    const available=product.inventory+produced;
    const sold=Math.min(available,demand);
    product.inventory=available-sold; product.dailySales=sold;
    const holdingCost=product.inventory*product.unitCost*settings.inventoryHoldingRate/1000000;
    totalDemand+=demand; totalPotential+=product.marketPotential; totalSold+=sold; totalInventory+=product.inventory; totalRevenue+=sold*product.price/1000000; totalHoldingCost+=holdingCost;
    totalProductionCost+=produced*inflatedUnitCost/1000000; totalMarketing+=product.marketing;
  }
  company.dailyInterest=company.bondDebt*company.bondRate/240;
  const operatingCost=(totalMarketing+company.research)/1000+settings.fixedOperatingCost+totalHoldingCost;
  const subsidiaryIncome=companies.slice(1).reduce((sum,target)=>sum+(target.profit/240)*target.novaStake,0);
  const synergy=controlledSubsidiaries().reduce((sum,target)=>sum+acquisitionSynergy(target),0);
  const profit=totalRevenue-totalProductionCost-operatingCost-company.dailyInterest+subsidiaryIncome+synergy;
  company.inventory=totalInventory;
  company.companyCash=Math.max(0,company.companyCash+profit);
  company.dailySales=totalSold;
  company.dailyRevenue=totalRevenue;
  company.dailyOperatingProfit=profit;
  const researchSynergy=companies.find(c=>c.ticker==="MEDI")?.controlled?1.35:1;
  activeProducts.forEach(p=>p.quality=Math.min(1.75,p.quality+company.research/260000/activeProducts.length*researchSynergy));
  company.quality=activeProducts.reduce((sum,p)=>sum+p.quality,0)/activeProducts.length;
  const fillRate=totalDemand?totalSold/totalDemand:0, inventoryDays=totalSold?totalInventory/totalSold:totalInventory/Math.max(1,activeProducts.reduce((sum,p)=>sum+p.production,0));
  company.customerSatisfaction=clamp(50+fillRate*30+company.quality*12-Math.max(0,inventoryDays-6)*4+(profit>=0?5:-7),0,100);
  company.brandScore=clamp(38+company.quality*25+Math.sqrt(totalMarketing)*3+company.marketShare*45,0,100);
  company.marketShare=clamp(company.marketShare*.94+(totalSold/Math.max(1,totalPotential*7))*.06,.04,.68);
  company.revenue=Math.max(1,Math.round(company.revenue*.985+totalRevenue*240*.015));
  company.profit=Math.round((company.profit*.985+profit*240*.015)*10)/10;
  company.growth=clamp((fillRate-.75)*.16+(company.quality-1)*.08+(company.customerSatisfaction-65)/1000,-.25,.4);
  if (company.companyCash<2) {
    state.news.unshift({day:state.day,text:"Nova Devices warns that its cash reserves are dangerously low.",impact:-.06,ticker:company.ticker});
    state.news=state.news.slice(0,6);
  }
}

function controlledSubsidiaries() { return companies.slice(1).filter(c=>c.controlled); }

function acquisitionSynergy(target) {
  const effects={GRNW:.006,HARB:.006,AXIS:.008,MEDI:.006};
  return effects[target.ticker]||0;
}

function takeoverBlockCost(target) {
  const marketCap=target.price*target.totalShares/1000000;
  const controlPremium=1.12+target.novaStake*.5+target.takeoverDefense;
  return marketCap*.1*controlPremium;
}

function acquisitionAssetValue() {
  return companies.slice(1).reduce((sum,target)=>sum+target.price*target.totalShares/1000000*target.novaStake,0);
}

function buyTakeoverBlock(ticker) {
  const nova=companies[0], target=companies.find(c=>c.ticker===ticker);
  if (!featureUnlocked("ma")) return takeoverMessage("M&A unlocks at $145,000 net worth or day 90.",false);
  if (!hasControl()) return takeoverMessage("You need board control before Nova can pursue an acquisition.",false);
  if (!target || target.controlled) return takeoverMessage("This target is already controlled by Nova.",false);
  const cost=takeoverBlockCost(target);
  if (nova.companyCash<cost+2) return takeoverMessage(`Nova needs ${money.format(cost*1000000)} plus a $2m cash reserve.`,false);
  nova.companyCash-=cost;
  target.novaStake=Math.min(.5,Math.round((target.novaStake+.1)*100)/100);
  target.price*=1.035;
  if (target.novaStake>=.5) {
    target.controlled=true;
    nova.marketShare=Math.min(.6,nova.marketShare+.025);
    state.news.unshift({day:state.day,text:`Nova Devices gained control of ${target.name}.`,impact:.05,ticker:"NOVA"});
    takeoverMessage(`${target.name} is now a controlled subsidiary and contributes earnings and synergies.`,true);
  } else {
    state.news.unshift({day:state.day,text:`Nova Devices increased its stake in ${target.name} to ${pct(target.novaStake)}.`,impact:.025,ticker:target.ticker});
    takeoverMessage(`Nova purchased another 10% of ${target.name}.`,true);
  }
  state.news=state.news.slice(0,6); seedBook(target); render();
}

function sellTakeoverBlock(ticker) {
  const nova=companies[0], target=companies.find(c=>c.ticker===ticker);
  if (!target || target.novaStake<.1) return takeoverMessage("Nova has no 10% block available to sell.",false);
  const wasControlled=target.controlled;
  const proceeds=target.price*target.totalShares/1000000*.1*.95;
  target.novaStake=Math.max(0,Math.round((target.novaStake-.1)*100)/100);
  nova.companyCash+=proceeds;
  if (wasControlled && target.novaStake<.5) {
    target.controlled=false;
    nova.marketShare=Math.max(.04,nova.marketShare-.025);
    state.news.unshift({day:state.day,text:`Nova Devices surrendered control of ${target.name}.`,impact:-.04,ticker:"NOVA"});
  }
  takeoverMessage(`Nova sold 10% of ${target.name} for ${money.format(proceeds*1000000)}.`,true);
  state.news=state.news.slice(0,6); render();
}

function takeoverMessage(text,good) {
  state.takeoverNotice=text;
  const el=document.querySelector("#takeover-status"); el.textContent=text; el.className=good?"up":"down";
}

function votingOwnership() {
  const company=companies[0];
  const portfolioVotes=Math.max(0,state.holdings[company.ticker]||0);
  return (company.founderShares+portfolioVotes)/company.totalShares;
}

function hasControl() { return votingOwnership()>.5; }

function corporateFinanceAction(action) {
  const company=companies[0];
  if (!hasControl()) return financeMessage("The board has removed you from control. Buy Nova shares to regain a majority.",false);
  if (action==="bond") {
    const newRate=Math.max(.035,state.economy.interestRate+.02+company.bondDebt*.001);
    company.bondRate=company.bondDebt?((company.bondRate*company.bondDebt)+(newRate*10))/(company.bondDebt+10):newRate;
    company.companyCash+=10; company.bondDebt+=10; company.debt+=10;
    financeMessage(`Nova issued a $10m bond at ${(newRate*100).toFixed(1)}%.`,true);
  } else if (action==="repay") {
    const amount=Math.min(5,company.bondDebt);
    if (!amount) return financeMessage("Nova has no outstanding game bonds to repay.",false);
    if (company.companyCash<amount) return financeMessage("Nova does not have enough company cash.",false);
    company.companyCash-=amount; company.bondDebt-=amount; company.debt-=amount;
    financeMessage(`Nova repaid $${amount}m of debt.`,true);
  } else if (action==="issue") {
    const shares=50000, proceeds=shares*company.price/1000000;
    company.totalShares+=shares; company.companyCash+=proceeds; company.price*=.97;
    state.news.unshift({day:state.day,text:`Nova Devices issued 50,000 shares and raised ${money.format(proceeds*1000000)}.`,impact:-.03,ticker:company.ticker});
    financeMessage("New shares raised cash but diluted every existing owner.",true);
  } else if (action==="buyback") {
    const shares=Math.min(25000,company.totalShares-company.founderShares-10000), cost=shares*company.price/1000000;
    if (shares<=0) return financeMessage("There are not enough public shares available for another buyback.",false);
    if (company.companyCash<cost+2) return financeMessage("Nova needs more company cash to fund this buyback safely.",false);
    company.totalShares-=shares; company.companyCash-=cost; company.price*=1.025;
    state.news.unshift({day:state.day,text:`Nova Devices repurchased ${shares.toLocaleString()} shares.`,impact:.025,ticker:company.ticker});
    financeMessage("The buyback reduced public shares and increased your voting percentage.",true);
  }
  state.news=state.news.slice(0,6); seedBook(company); render();
}

function financeMessage(text,good) {
  const el=document.querySelector("#finance-message"); el.textContent=text; el.className=good?"up":"down";
}

function applyManagementDecisions() {
  if (!hasControl()) return financeMessage("You need majority voting control to set company strategy.",false);
  const company=companies[0], product=company.products[state.selectedProduct] || company.products.find(item=>item.active);
  if (!product) return financeMessage("No active product is available to manage.",false);
  const decisions={
    price:+document.querySelector("#product-price").value,
    production:+document.querySelector("#production").value,
    marketing:+document.querySelector("#marketing").value
  };
  Object.assign(product,decisions);
  company.research=+document.querySelector("#research").value;
  company.pendingDecisions=null;
  addLedger(`Updated ${product.name} strategy`,0);
  evaluateMissions();
  playCue("order");
  render();
  const button=document.querySelector("#apply-decisions"), feedback=document.querySelector("#management-feedback");
  document.querySelector("#operations-status").textContent="Decisions applied";
  document.querySelector("#management-advice").textContent="Management decisions are active now. Advance time to see the sales and profit impact.";
  document.querySelector("#status-headline").textContent=`${product.name} strategy updated: price ${money.format(product.price)}, production ${product.production.toLocaleString()} units.`;
  message("Management decisions applied. Advance time to see the new results.",true);
  button.textContent="Applied - run time to see result";
  button.classList.add("applied");
  feedback?.classList.add("flash");
  renderManagementPreview(true);
  setTimeout(()=>{button.classList.remove("applied"); feedback?.classList.remove("flash"); button.textContent="Apply management decisions";},1800);
}

function launchProduct(index) {
  const company=companies[0], product=company.products[index];
  if (!hasControl()) return financeMessage("Board control is required to approve a product launch.",false);
  if (!product || product.active) return;
  if (company.companyCash<product.launchCost+3) return financeMessage(`Nova needs $${product.launchCost+3}m to launch and retain a cash buffer.`,false);
  company.companyCash-=product.launchCost; product.active=true; state.selectedProduct=index;
  state.news.unshift({day:state.day,text:`Nova Devices launched ${product.name} for the ${product.segment.toLowerCase()} market.`,impact:.04,ticker:"NOVA"});
  state.news=state.news.slice(0,6); render();
}

function stockPortfolioValue(){ return companies.reduce((sum,c)=>sum+(state.holdings[c.ticker]||0)*c.price,0); }
function optionsPortfolioValue(){ return state.optionPositions.reduce((sum,position)=>sum+optionPositionValue(position),0); }
function portfolioValue(){ return stockPortfolioValue()+optionsPortfolioValue(); }
function accountEquity(){ return state.cash+portfolioValue(); }
function pct(value){ return `${value>=0?"+":""}${(value*100).toFixed(2)}%`; }
function message(text,good){ const el=document.querySelector("#trade-message"); el.textContent=text; el.className=good?"up":"down"; }

function ensureMissionDefaults() {
  if (!state.mode || state.mode==="open") state.mode="guided";
  if (!state.missions) state.missions={};
  if (!state.missions.selected) state.missions.selected="save-nova";
  if (!Array.isArray(state.missions.completed)) state.missions.completed=[];
  state.missions.profitableDays=state.missions.profitableDays||0;
  state.missions.lastProfitDay=state.missions.lastProfitDay||0;
  ["priceAdjusted","productionAdjusted","marketingAdjusted","researchAdjusted"].forEach(key=>state.missions[key]=Boolean(state.missions[key]));
}

function currentMission() {
  ensureMissionDefaults();
  return learningMissions.find(mission=>mission.id===state.missions.selected) || learningMissions[0];
}

function businessSignals() {
  const c=companies[0], active=c.products.filter(p=>p.active);
  const potential=active.reduce((sum,p)=>sum+p.marketPotential,0)||1;
  const activeProduction=active.reduce((sum,p)=>sum+p.production,0)||1;
  const demand=Math.max(0,Math.min(1.4,c.dailySales/potential));
  const inventoryDays=c.dailySales>0?c.inventory/c.dailySales:c.inventory/activeProduction;
  const satisfaction=Math.round(c.customerSatisfaction ?? clamp(62+demand*30-Math.max(0,inventoryDays-5)*5+(c.dailyOperatingProfit>=0?8:-12),0,100));
  const brand=Math.round(c.brandScore ?? clamp(c.quality*42+Math.sqrt(active.reduce((sum,p)=>sum+p.marketing,0))*3,0,100));
  const bottleneck=facilityBottleneck();
  return {demand,satisfaction,brand,inventoryDays,bottleneck};
}

function facilityBottleneck() {
  const factories=state.facilities.filter(f=>facilityRole(f.type)==="factory").reduce((sum,f)=>sum+f.capacity*f.level,0);
  const stores=state.facilities.filter(f=>facilityRole(f.type)==="store").reduce((sum,f)=>sum+f.capacity*f.level,0);
  if (!factories && !stores) return "No supply chain built yet.";
  if (factories>stores*1.25) return "Factory output is higher than retail capacity.";
  if (stores>factories*1.25) return "Retail capacity is waiting for more production.";
  return "Supply chain capacity is balanced.";
}

function missionObjectives(mission) {
  const c=companies[0], signals=businessSignals();
  const healthyInventory=c.inventory>250 && c.inventory<9000;
  const hasStock=Object.values(state.holdings||{}).some(qty=>qty>0);
  const hasFacility=state.facilities.length>0;
  const hasEmpireScale=state.facilities.length>=2 || c.products.filter(p=>p.active).length>=2 || state.facilities.some(f=>f.level>=2);
  const map={
    "save-nova":[["Survive 7 days",state.day>=8],["Company cash above $0",c.companyCash>0],["At least 1 profitable day",state.missions.profitableDays>=1]],
    "right-price":[["Change product price",state.missions.priceAdjusted],["Reach 60% customer demand",signals.demand>=.6],["Avoid excessive inventory",healthyInventory]],
    "control-production":[["Change production",state.missions.productionAdjusted],["Keep inventory healthy",healthyInventory],["Sell at least 500 units/day",c.dailySales>=500]],
    "smart-marketing":[["Change marketing budget",state.missions.marketingAdjusted],["Demand at 60% or better",signals.demand>=.6],["Daily profit is positive",c.dailyOperatingProfit>0]],
    "first-report":[["Review business pulse",state.day>=10],["Know your cash",c.companyCash>0],["Know satisfaction/brand",signals.satisfaction>=50 && signals.brand>=40]],
    "unlock-market":[["Choose any listed company",screenUnlocked("market")],["Buy one stock",hasStock],["Portfolio has value",portfolioValue()>0]],
    "supply-chain":[["Build one facility",hasFacility],["See input/output guide",hasFacility],["Supply chain has capacity",hasFacility && state.facilities.some(f=>f.capacity>0)]],
    "build-empire":[["Operate two assets or upgrade one",hasEmpireScale],["Nova still solvent",c.companyCash>0],["Founder keeps control",hasControl()]]
  };
  return map[mission.id] || [];
}

function missionComplete(mission) {
  return missionObjectives(mission).every(item=>item[1]);
}

function evaluateMissions() {
  ensureMissionDefaults();
  const mission=currentMission();
  if (mission && missionComplete(mission) && !state.missions.completed.includes(mission.id)) {
    state.missions.completed.push(mission.id);
    addLedger(`Task complete: ${mission.title}`,0);
    state.news.unshift({day:state.day,ticker:"TASK",impact:.01,text:`Challenge complete: ${mission.title}. ${mission.reward}`});
    state.news=state.news.slice(0,6);
  }
}

function updateMissionProgress() {
  ensureMissionDefaults();
  const c=companies[0];
  if (c.dailyOperatingProfit>0 && state.missions.lastProfitDay!==state.day) {
    state.missions.profitableDays++;
    state.missions.lastProfitDay=state.day;
  }
  evaluateMissions();
}

function screenUnlocked(screen) {
  return true;
}

function lockSection(selector, screen, messageText) {
  const el=document.querySelector(selector);
  if (!el) return;
  const locked=!screenUnlocked(screen);
  el.classList.toggle("locked-panel",locked);
  if (locked) el.dataset.lockMessage=messageText;
  else delete el.dataset.lockMessage;
}

function renderModeLocks() {
  ["#market","#trading","#portfolio-section",".institutions",".financial-reports","#empire","#finance",".options","#deals"].forEach(selector=>{
    const el=document.querySelector(selector);
    if (!el) return;
    el.classList.remove("locked-panel");
    delete el.dataset.lockMessage;
  });
}

function markMissionInput(id) {
  ensureMissionDefaults();
  if (id==="product-price") state.missions.priceAdjusted=true;
  if (id==="production") state.missions.productionAdjusted=true;
  if (id==="marketing") state.missions.marketingAdjusted=true;
  if (id==="research") state.missions.researchAdjusted=true;
  evaluateMissions();
}

function startExpertMode(startTutorial=false) {
  newGame(false,"expert");
  message("Expert Mode started. No email required to play. Your game is saved locally in this browser.",true);
}

function selectCompany(index) {
  state.selected=(index+companies.length)%companies.length;
  const selected=companies[state.selected];
  if(state.orderType==="limit"||state.orderType==="stop-limit") document.querySelector("#limit-price").value=selected.price.toFixed(2);
  if(state.orderType==="stop"||state.orderType==="stop-limit") document.querySelector("#stop-price").value=(selected.price*(state.side==="buy"?1.03:.97)).toFixed(2);
  render();
}

function handleKeyboard(event) {
  const tag=event.target.tagName;
  if (tag==="INPUT" || tag==="SELECT" || tag==="TEXTAREA") return;
  const key=event.key.toLowerCase();
  if (key==="arrowright" || key==="d") { event.preventDefault(); selectCompany(state.selected+1); playCue("click"); }
  else if (key==="arrowleft" || key==="a") { event.preventDefault(); selectCompany(state.selected-1); playCue("click"); }
  else if (key==="arrowup" || key==="w") { event.preventDefault(); const q=document.querySelector("#quantity"); q.value=Math.min(999999,(+q.value||0)+10); updateEstimate(); playCue("click"); }
  else if (key==="arrowdown" || key==="s") { event.preventDefault(); const q=document.querySelector("#quantity"); q.value=Math.max(1,(+q.value||1)-10); updateEstimate(); playCue("click"); }
  else if (key===" " && document.querySelector("#launch-modal").classList.contains("hidden")) { event.preventDefault(); executeTrade(); }
  else if (key==="enter") { event.preventDefault(); runDays(1); }
  else if (key==="m") { event.preventDefault(); toggleAudio(); }
  else if (key==="escape") { finishTutorial(); document.querySelector("#game-modal").classList.add("hidden"); }
}

function setupTouchControls() {
  const chart=document.querySelector("#chart");
  chart.addEventListener("pointerdown",event=>{runtime.touchStart={x:event.clientX,y:event.clientY};});
  chart.addEventListener("pointerup",event=>{
    if (!runtime.touchStart) return;
    const dx=event.clientX-runtime.touchStart.x, dy=event.clientY-runtime.touchStart.y;
    runtime.touchStart=null;
    if (Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)) { selectCompany(state.selected+(dx<0?1:-1)); playCue("click"); }
    else if (Math.abs(dy)>45) { runDays(dy<0?5:1); }
  });
}

function updateFrame(delta) {
  runtime.frames++;
  runtime.fpsTime+=delta;
  if (runtime.fpsTime>=500) {
    runtime.fps=Math.round(runtime.frames*1000/runtime.fpsTime);
    runtime.frames=0; runtime.fpsTime=0;
  }
}

function renderFrame() {
  const fps=document.querySelector("#status-fps");
  if (fps) fps.textContent=String(Math.max(1,Math.min(99,runtime.fps)));
}

function gameLoop(timestamp) {
  const delta=runtime.lastFrame?Math.min(100,timestamp-runtime.lastFrame):16.67;
  runtime.lastFrame=timestamp;
  updateFrame(delta);
  if (state.autoTime?.running && !state.gameOver && document.querySelector("#launch-modal").classList.contains("hidden")) {
    state.autoTime.accumulator+=delta;
    const interval=Math.max(120,1400/(state.autoTime.speed||1));
    if (state.autoTime.accumulator>=interval) {
      state.autoTime.accumulator=0;
      advanceDay(true);
    }
  }
  if (timestamp-runtime.lastAutoSave>5000 && !state.gameOver) {
    runtime.lastAutoSave=timestamp;
    autoSaveLocal("timer");
  }
  renderFrame();
  requestAnimationFrame(gameLoop);
}

function toggleTime() {
  ensureStateDefaults();
  state.autoTime.running=!state.autoTime.running;
  state.autoTime.accumulator=0;
  document.querySelector("#time-toggle").textContent=state.autoTime.running?"Pause time":"Start time";
  playCue(state.autoTime.running?"day":"click");
}

function renderDashboard(worth,investments) {
  const hero=document.querySelector("#hero-net-worth"),previous=Number(hero.dataset.value||worth),dailyPnl=worth-(state.dayStartEquity||state.startWorth);
  renderPlayerBrand();
  hero.textContent=money.format(worth); hero.dataset.value=worth;
  if (Math.abs(worth-previous)>.01) {
    hero.className=worth>previous?"flash-up":"flash-down";
    setTimeout(()=>hero.className="",320);
  }
  const pnl=document.querySelector("#hero-daily-pnl");
  pnl.textContent=`${dailyPnl>=0?"\u25B2":"\u25BC"} ${money.format(Math.abs(dailyPnl))} today`;
  pnl.className=`hero-pnl ${dailyPnl>=0?"up":"down"}`;
  const history=[...(state.equityHistory||[]),worth].slice(-30),min=Math.min(...history),max=Math.max(...history);
  document.querySelector("#equity-sparkline").innerHTML=history.map(value=>`<i style="height:${12+(value-min)/(max-min||1)*43}px"></i>`).join("");

  const colors=["#3b82f6","#00d68f","#fbbf24","#ff4757","#a78bfa"],positions=companies.map((company,index)=>({company,index,value:Math.abs((state.holdings[company.ticker]||0)*company.price)})).filter(item=>item.value>0);
  const total=positions.reduce((sum,item)=>sum+item.value,0);
  let cursor=0;
  const stops=positions.map(item=>{const start=cursor;cursor+=item.value/(total||1)*100;return `${colors[item.index]} ${start}% ${cursor}%`;});
  document.querySelector("#allocation-ring").style.background=stops.length?`conic-gradient(${stops.join(",")})`:"#263244";
  document.querySelector("#allocation-count").textContent=positions.length;
  document.querySelector("#allocation-legend").innerHTML=positions.length?positions.map(item=>`<div><i style="background:${colors[item.index]}"></i><span>${item.company.ticker}</span><strong>${(item.value/total*100).toFixed(0)}%</strong></div>`).join(""):`<p style="color:var(--muted);font-size:11px">Your allocation appears after the first trade.</p>`;

  const movers=[...companies].sort((a,b)=>Math.abs((b.price-b.previous)/b.previous)-Math.abs((a.price-a.previous)/a.previous)).slice(0,5);
  document.querySelector("#top-movers").innerHTML=movers.map(company=>{const change=(company.price-company.previous)/company.previous;return `<div class="mover-row"><span><b>${company.ticker}</b><small>${company.name}</small></span><strong class="${change>=0?"up":"down"}">${pct(change)}</strong></div>`}).join("");

  const shortExposure=companies.reduce((sum,c)=>sum+Math.max(0,-(state.holdings[c.ticker]||0))*c.price,0);
  const buyingPower=Math.max(0,state.cash+accountEquity()*1.25-shortExposure);
  document.querySelector("#buying-power").textContent=money.format(buyingPower);
  document.querySelector("#margin-used").textContent=money.format(shortExposure);
  document.querySelector("#trades-today").textContent=state.ledger.filter(item=>item.day===state.day&&/^(Bought|Sold)/.test(item.text)).length;
  document.querySelector("#orders-count").textContent=state.openOrders.length;
  renderMissionDashboard();
}

function renderMissionDashboard() {
  ensureMissionDefaults();
  const mission=currentMission(), signals=businessSignals(), c=companies[0];
  const completed=state.missions.completed.includes(mission.id), number=learningMissions.findIndex(item=>item.id===mission.id)+1;
  document.querySelector("#mission-kicker").textContent="OPEN PLAY - OPTIONAL TASKS";
  document.querySelector("#mission-title").textContent=`Challenge ${number}: ${mission.title}`;
  document.querySelector("#mission-description").textContent=`${mission.description} Reward: ${mission.reward}`;
  const selector=document.querySelector("#task-select");
  if (selector) {
    selector.innerHTML=learningMissions.map((item,index)=>`<option value="${item.id}" ${item.id===mission.id?"selected":""}>${state.missions.completed.includes(item.id)?"✓ ":""}${index+1}. ${item.title}</option>`).join("");
  }
  document.querySelector("#mission-objectives").innerHTML=missionObjectives(mission).map(([label,done])=>`<div class="mission-objective ${done?"done":""}"><span>${label}</span><strong>${done?"Done":"Open"}</strong></div>`).join("")+`<div class="mission-objective ${completed?"done":"optional"}"><span>Status</span><strong>${completed?"Completed":"Optional"}</strong></div>`;
  document.querySelector("#mission-report").innerHTML=[
    ["Cash",`$${c.companyCash.toFixed(2)}m`,c.companyCash>0],
    ["Revenue",`$${c.dailyRevenue.toFixed(2)}m`,c.dailyRevenue>0],
    ["Profit",`${c.dailyOperatingProfit>=0?"+":""}$${c.dailyOperatingProfit.toFixed(2)}m`,c.dailyOperatingProfit>=0],
    ["Inventory",c.inventory.toLocaleString(),c.inventory<9000],
    ["Demand",`${Math.round(signals.demand*100)}%`,signals.demand>=.6],
    ["Satisfaction",`${signals.satisfaction}/100`,signals.satisfaction>=60],
    ["Brand",`${signals.brand}/100`,signals.brand>=50],
    ["Mode",state.mode==="expert"?"Expert Mode":"Guided Mode",true]
  ].map(item=>`<div><span>${item[0]}</span><strong class="${item[2]?"up":"down"}">${item[1]}</strong></div>`).join("");
}

function renderMarketOverview() {
  const items=companies.map((company,index)=>({company,index,change:(company.price-company.previous)/company.previous,marketValue:company.price*(company.totalShares||1000000)}));
  const rising=items.filter(item=>item.change>=0).length;
  document.querySelector("#market-breadth").textContent=`${rising} advancing / ${items.length-rising} declining`;
  document.querySelector("#market-heatmap").innerHTML=items.map(item=>{
    const intensity=Math.min(.78,.22+Math.abs(item.change)*7),color=item.change>=0?`rgba(0,214,143,${intensity})`:`rgba(255,71,87,${intensity})`;
    return `<button class="heatmap-tile" data-heatmap-index="${item.index}" style="background:${color}"><strong>${item.company.ticker}</strong><small>${item.company.sector}</small><span>${pct(item.change)}</span></button>`;
  }).join("");
  document.querySelectorAll("[data-heatmap-index]").forEach(button=>button.onclick=()=>{state.selected=+button.dataset.heatmapIndex;render();document.querySelector(".workspace").scrollIntoView({behavior:"smooth",block:"start"});});
}

function renderTickerTape() {
  const markup=companies.map(company=>{const change=(company.price-company.previous)/company.previous;return `<span class="ticker-item ${change>=0?"up":"down"}"><b>${company.ticker}</b><span>${money.format(company.price)}</span><span>${change>=0?"\u25B2":"\u25BC"} ${Math.abs(change*100).toFixed(2)}%</span></span>`}).join("");
  document.querySelector("#ticker-tape").innerHTML=markup+markup;
}

function renderStatusConsole(worth) {
  const latest=state.news[0];
  document.querySelector("#status-headline").textContent=latest?`DAY ${latest.day}: ${latest.text}`:"Market network online. Advance time to receive corporate news.";
  document.querySelector("#status-cash").textContent=money.format(state.cash);
  const profit=worth-state.startWorth,profitEl=document.querySelector("#status-profit");
  profitEl.textContent=money.format(profit);
  profitEl.className=profit>=0?"up":"down";
  document.querySelector("#status-date").textContent=`DAY ${state.day} / YEAR ${Math.floor((state.day-1)/TRADING_DAYS_PER_YEAR)+1}`;
}

function renderChart(company) {
  const canvas=document.querySelector("#chart"), ctx=canvas.getContext("2d"), dpr=window.devicePixelRatio||1;
  const width=canvas.clientWidth, height=canvas.clientHeight; canvas.width=width*dpr; canvas.height=height*dpr; ctx.scale(dpr,dpr);
  const data=company.history, min=Math.min(...data)*.98, max=Math.max(...data)*1.02, x=i=>20+i*(width-40)/(data.length-1), y=v=>height-20-(v-min)*(height-40)/(max-min||1);
  ctx.clearRect(0,0,width,height); ctx.strokeStyle="#3484cf"; ctx.lineWidth=1;
  for(let i=1;i<5;i++){ctx.beginPath();ctx.moveTo(20,i*height/5);ctx.lineTo(width-20,i*height/5);ctx.stroke();}
  const rising=data.at(-1)>=data[0], color=rising?"#00f0a0":"#ff5264", gradient=ctx.createLinearGradient(0,0,0,height); gradient.addColorStop(0,rising?"#00f0a055":"#ff526455"); gradient.addColorStop(1,"transparent");
  ctx.beginPath(); data.forEach((v,i)=>i?ctx.lineTo(x(i),y(v)):ctx.moveTo(x(i),y(v))); ctx.lineTo(x(data.length-1),height-20);ctx.lineTo(20,height-20);ctx.closePath();ctx.fillStyle=gradient;ctx.fill();
  ctx.beginPath();data.forEach((v,i)=>i?ctx.lineTo(x(i),y(v)):ctx.moveTo(x(i),y(v)));ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();
}

function render() {
  ensureStateDefaults();
  checkProgression();
  const company=companies[state.selected], investments=portfolioValue(), worth=state.cash+investments, change=(company.price-company.previous)/company.previous;
  document.querySelector("#date").textContent=`Year ${Math.floor((state.day-1)/TRADING_DAYS_PER_YEAR)+1}, Q${Math.floor(((state.day-1)%TRADING_DAYS_PER_YEAR)/60)+1}, Day ${state.day}`;
  document.querySelector("#time-toggle").textContent=state.autoTime.running?"Pause time":"Start time";
  document.querySelector("#time-speed").value=String(state.autoTime.speed||1);
  companies[0].name=state.player.companyName||companies[0].name;
  document.querySelector("#cash").textContent=money.format(state.cash); document.querySelector("#investments").textContent=money.format(investments); document.querySelector("#net-worth").textContent=money.format(worth);
  const returnEl=document.querySelector("#return"); returnEl.textContent=pct(worth/state.startWorth-1); returnEl.className=worth>=state.startWorth?"up":"down";
  document.querySelector("#stock-list").innerHTML=companies.map((c,i)=>{const ch=(c.price-c.previous)/c.previous;return `<button class="stock ${i===state.selected?"active":""}" data-index="${i}"><span><strong>${c.ticker}</strong><small>${c.name}</small></span><span class="stock-price"><strong>${money.format(c.price)}</strong><small class="${ch>=0?"up":"down"}">${pct(ch)}</small></span></button>`}).join("");
  document.querySelectorAll(".stock").forEach(el=>el.onclick=()=>{selectCompany(+el.dataset.index); message("",true); playCue("click");});
  document.querySelector("#sector").textContent=company.sector;document.querySelector("#company-name").textContent=company.name;document.querySelector("#ticker").textContent=`NASDAQ: ${company.ticker}`;document.querySelector("#price").textContent=money.format(company.price);
  const changeEl=document.querySelector("#change");changeEl.textContent=pct(change);changeEl.className=change>=0?"up":"down";
  document.querySelector("#fundamentals").innerHTML=[["Revenue",`$${company.revenue}m`],["Net profit",`$${company.profit}m`],["Debt",`$${company.debt}m`],["Dividend yield",pct(company.dividendYield)]].map(x=>`<div><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join("");
  const rows=orders=>orders.slice(0,5).map(o=>`<div class="order-row"><span class="${o.side==="buy"?"up":"down"}">${money.format(o.price)}</span><span>${o.quantity} shares</span></div>`).join("");
  document.querySelector("#bids").innerHTML=rows(company.book.bids);document.querySelector("#asks").innerHTML=rows(company.book.asks);
  const held=state.holdings[company.ticker]||0, avg=state.averageCost[company.ticker]||0;
  const positionProfit=(company.price-avg)*held;
  document.querySelector("#position").innerHTML=`<div><span>Position</span><strong>${held>0?`${held} long`:held<0?`${Math.abs(held)} short`:"None"}</strong></div><div><span>Average entry</span><strong>${held?money.format(avg):"-"}</strong></div><div><span>Unrealized P/L</span><strong class="${positionProfit>=0?"up":"down"}">${held?money.format(positionProfit):"-"}</strong></div>`;
  const ownedCompanies=companies.filter(c=>state.holdings[c.ticker]);
  document.querySelector("#portfolio").innerHTML=ownedCompanies.length
    ? `<div class="portfolio-row"><span>Company</span><span>Position</span><span>Value</span><span>P/L</span></div>`+ownedCompanies.map(c=>{const h=state.holdings[c.ticker],pl=(c.price-state.averageCost[c.ticker])*h;return `<div class="portfolio-row"><span><strong>${c.ticker}</strong> ${c.name}</span><span>${h>0?`${h} long`:`${Math.abs(h)} short`}</span><span>${money.format(h*c.price)}</span><span class="${pl>=0?"up":"down"}">${money.format(pl)}</span></div>`}).join("")
    : `<p style="padding:20px;color:var(--muted)">Your portfolio is empty. Choose a company and place your first order.</p>`;
  document.querySelector("#news").innerHTML=state.news.length?state.news.map(n=>`<div class="news-item"><time>DAY ${n.day} &middot; ${n.ticker}</time><p>${n.text} <strong class="${n.impact>=0?"up":"down"}">${pct(n.impact)}</strong></p></div>`).join(""):`<p style="padding:20px 4px;color:var(--muted)">No major news yet. Run the next day to move the market.</p>`;
  renderDashboard(worth,investments); renderMarketOverview(); renderTickerTape(); renderStatusConsole(worth); renderAdvisor(); renderCampaign(); renderProgression(); renderEconomy(); renderActivity(); renderInstitutions(); renderFinancialReports(); renderOptions(); renderOperations(); renderFacilities(); renderFinance(); renderTakeovers(); renderModeLocks(); updateEstimate(); renderChart(company);
}

function renderProgression() {
  const next=progressionMilestones.find(milestone=>!featureUnlocked(milestone.id));
  document.querySelector("#progression-status").textContent="All systems available";
  document.querySelector("#progression-list").innerHTML=progressionMilestones.map((milestone,index)=>{
    const open=featureUnlocked(milestone.id),current=next?.id===milestone.id;
    const requirement=milestone.id==="basic"?"Available immediately":`${money.format(milestone.worth)} net worth or day ${milestone.day}`;
    return `<article class="progression-step ${open?"unlocked":""} ${current?"current":""}"><span class="step-number">SYSTEM ${index+1}</span><h3>${milestone.name}</h3><p>${milestone.description}</p><strong class="${open?"up":""}">${open?"AVAILABLE":requirement}</strong></article>`;
  }).join("");
  const limitOpen=featureUnlocked("limit");
  document.querySelector("#order-type-select").value=state.orderType;
  const usesLimit=state.orderType==="limit"||state.orderType==="stop-limit",usesStop=state.orderType==="stop"||state.orderType==="stop-limit";
  document.querySelector("#limit-price-label").classList.toggle("hidden",!usesLimit);
  document.querySelector("#stop-price-label").classList.toggle("hidden",!usesStop);
  [...document.querySelector("#order-type-select").options].forEach(option=>{if(option.value!=="market")option.disabled=!limitOpen;});
  if (!limitOpen && state.orderType!=="market") {
    state.orderType="market";
    document.querySelector("#order-type-select").value="market";
    document.querySelector("#limit-price-label").classList.add("hidden");
    document.querySelector("#stop-price-label").classList.add("hidden");
  }
  document.querySelector("[data-side='sell']").textContent=featureUnlocked("short")?"Sell / Short":"Sell (short locked)";
  document.querySelector(".options").classList.toggle("system-locked",!featureUnlocked("options"));
  document.querySelector("#buy-option").disabled=!featureUnlocked("options");
  document.querySelector(".takeovers").classList.toggle("system-locked",!featureUnlocked("ma"));
}

function renderInstitutions() {
  const totalCapital=state.aiFunds.reduce((sum,fund)=>sum+fund.cash+companies.reduce((value,c)=>value+(fund.holdings[c.ticker]||0)*c.price,0),0);
  document.querySelector("#institution-status").textContent=`${money.format(totalCapital)} managed capital`;
  document.querySelector("#institution-list").innerHTML=state.aiFunds.map(fund=>{
    const positions=companies.filter(c=>fund.holdings[c.ticker]).map(c=>`${c.ticker} ${fund.holdings[c.ticker]>0?"+":""}${fund.holdings[c.ticker]}`).join(" | ")||"All cash";
    const worth=fund.cash+companies.reduce((sum,c)=>sum+(fund.holdings[c.ticker]||0)*c.price,0), performance=worth/fund.startWorth-1;
    return `<article class="institution-card"><header><i style="color:${fund.color};background:${fund.color}"></i><div><h3>${fund.name}</h3><small>${fund.strategy} strategy</small></div></header><div class="institution-kpis"><span>Fund value<strong>${money.format(worth)}</strong></span><span>Return<strong class="${performance>=0?"up":"down"}">${pct(performance)}</strong></span><span>Cash<strong>${money.format(fund.cash)}</strong></span><span>Positions<strong>${Object.keys(fund.holdings).length}</strong></span></div><p class="institution-holdings">${positions}</p></article>`;
  }).join("");
  document.querySelector("#institution-activity").innerHTML=state.institutionActivity.length?state.institutionActivity.map(trade=>`<div class="institution-trade"><time>DAY ${trade.day}</time><span>${trade.fund}</span><span class="${trade.side==="buy"?"up":"down"}">${trade.side.toUpperCase()} ${trade.quantity} ${trade.ticker}</span><span>${money.format(trade.price)}</span></div>`).join(""):`<p style="padding:12px 0;color:var(--muted)">Advance time to see institutional orders enter the market.</p>`;
}

function renderOptions() {
  const company=companies[state.selected], strikeSelect=document.querySelector("#option-strike"), current=+strikeSelect.value;
  const strikes=[.8,.9,1,1.1,1.2].map(mult=>Math.max(1,Math.round(company.price*mult/5)*5));
  const unique=[...new Set(strikes)];
  strikeSelect.innerHTML=unique.map(strike=>`<option value="${strike}" ${strike===current?"selected":""}>${money.format(strike)}</option>`).join("");
  if (!unique.includes(current)) strikeSelect.value=unique[Math.floor(unique.length/2)];
  const type=state.optionType,strike=+strikeSelect.value,days=+document.querySelector("#option-expiry").value,contracts=Math.max(1,+document.querySelector("#option-contracts").value||1);
  const premium=optionUnitPrice(company,type,strike,days),cost=premium*100*contracts;
  document.querySelector("#options-underlying").textContent=`${company.name} (${company.ticker}) at ${money.format(company.price)}`;
  document.querySelector("#options-status").textContent=featureUnlocked("options")?`${state.optionPositions.length} open contract position${state.optionPositions.length===1?"":"s"}`:"LOCKED - reach $125k or day 50";
  document.querySelector("#option-premium").textContent=money.format(premium*100);
  document.querySelector("#option-cost").textContent=money.format(cost);
  document.querySelector("#buy-option").textContent=`Buy ${contracts} ${type}${contracts>1?"s":""}`;
  const breakEven=type==="call"?strike+premium:strike-premium;
  document.querySelector("#option-explanation").textContent=`Break-even at expiry: ${money.format(breakEven)}. ${days} days remain in the selected contract.`;
  document.querySelector("#option-positions").innerHTML=state.optionPositions.length?state.optionPositions.map(position=>{
    const value=optionPositionValue(position),entry=position.entryPremium*100*position.contracts,pl=value-entry,remaining=Math.max(0,position.expiryDay-state.day);
    return `<div class="option-position"><span><strong>${position.ticker} ${position.type.toUpperCase()}</strong><small>${position.contracts} contract${position.contracts>1?"s":""}</small></span><span>${money.format(position.strike)} strike</span><span>${remaining} days</span><span class="${pl>=0?"up":"down"}">${money.format(pl)}</span><button data-close-option="${position.id}">Close</button></div>`;
  }).join(""):`<p style="padding:14px 0;color:var(--muted)">No open option positions.</p>`;
  document.querySelectorAll("[data-close-option]").forEach(button=>button.onclick=()=>sellOptionPosition(+button.dataset.closeOption));
}

function renderFinancialReports() {
  const company=companies[state.selected], report=company.reports[0];
  document.querySelector("#report-company").textContent=`${company.name} (${company.ticker})`;
  if (!report) {
    document.querySelector("#earnings-signal").textContent="Awaiting first quarter";
    document.querySelector("#earnings-signal").className="";
    document.querySelector("#latest-report").innerHTML=`<div><span>Revenue estimate</span><strong>$${company.analystRevenue.toFixed(2)}m</strong></div><div><span>Profit estimate</span><strong>$${company.analystProfit.toFixed(2)}m</strong></div><div><span>Current revenue accrued</span><strong>$${company.quarterlyRevenue.toFixed(2)}m</strong></div><div><span>Current profit accrued</span><strong>$${company.quarterlyProfit.toFixed(2)}m</strong></div>`;
    document.querySelector("#report-history").innerHTML=`<p style="padding:14px 0;color:var(--muted)">The first report publishes at the end of day 60.</p>`;
    document.querySelector("#analyst-commentary").textContent="Expectations are forming. Advance time and monitor operating performance before the quarter closes.";
    return;
  }
  const signal=report.combined>.025?"Earnings beat":report.combined<-.025?"Earnings miss":"In line";
  document.querySelector("#earnings-signal").textContent=signal;
  document.querySelector("#earnings-signal").className=report.combined>=.025?"up":report.combined<=-.025?"down":"";
  const metrics=[
    ["Revenue",`$${report.revenue.toFixed(2)}m`,report.revenueSurprise>=0],
    ["Revenue surprise",pct(report.revenueSurprise),report.revenueSurprise>=0],
    ["Net profit",`$${report.profit.toFixed(2)}m`,report.profit>=0],
    ["Profit surprise",pct(report.profitSurprise),report.profitSurprise>=0],
    ["Net margin",pct(report.margin),report.margin>=.08],
    ["Cash",`$${report.cash.toFixed(2)}m`,report.cash>=5],
    ["Debt",`$${report.debt.toFixed(1)}m`,report.debt<250],
    ["Price reaction",pct(report.combined*.45),report.combined>=0]
  ];
  document.querySelector("#latest-report").innerHTML=metrics.map(m=>`<div><span>${m[0]}</span><strong class="${m[2]?"up":"down"}">${m[1]}</strong></div>`).join("");
  document.querySelector("#report-history").innerHTML=`<div class="report-row"><span>Quarter</span><span>Revenue</span><span>Profit</span><span>Surprise</span></div>`+company.reports.map(r=>`<div class="report-row"><span>Q${r.quarter}</span><span>$${r.revenue.toFixed(1)}m</span><span>$${r.profit.toFixed(1)}m</span><span class="${r.combined>=0?"up":"down"}">${pct(r.combined)}</span></div>`).join("");
  let commentary="Results were broadly balanced.";
  if(report.profitSurprise>0&&report.revenueSurprise<0) commentary="Profit beat despite weak revenue. Investors may question whether cost cutting can sustain growth.";
  else if(report.revenueSurprise>0&&report.profitSurprise<0) commentary="Revenue was strong, but margins disappointed. Growth is costing more than analysts expected.";
  else if(report.profitSurprise>.08&&report.margin>.1) commentary="A high-quality beat: profit, margin, and revenue support the positive reaction.";
  else if(report.combined<-.05) commentary="The miss was material. The next estimate has been reset lower, but credibility has weakened.";
  document.querySelector("#analyst-commentary").textContent=commentary;
}

const advisorTips=[
  {title:"Start with the business",text:"Review Nova Core in Product Portfolio. Set a competitive price, sensible production, marketing, and research, then apply the decisions before advancing time."},
  {title:"Watch cash and inventory",text:"Company cash belongs to Nova, while the cash at the top belongs to your trading account. Excess inventory traps corporate cash; stockouts leave demand unserved."},
  {title:"Trade what you understand",text:"Use the market panel to inspect fundamentals and the order book. Market orders trade immediately; limit orders wait. Shorts profit when shares fall. Options offer leveraged calls and puts with losses capped at the premium."},
  {title:"Choose funding carefully",text:"Bonds preserve ownership but add interest expense. New shares raise cash but dilute voting control and per-share value. Buybacks reverse dilution when Nova has spare cash."},
  {title:"Expand with discipline",text:"Launch Value or Pro only when Nova can fund the launch and keep a cash buffer. Acquisitions add earnings and synergies, but takeover premiums rise as rival boards resist."},
  {title:"Read the economy",text:"Interest rates affect valuations and bond coupons. Confidence drives product demand, inflation raises production costs, and different industries react differently to recessions."},
  {title:"Win the Ten Year Empire",text:"By the end of year 10, meet the net-worth and market-share targets, keep Nova solvent, and protect voting control. Use +1 week or +1 month once your operating decisions are stable."}
];

function expertAdvisorTip() {
  const c=companies[0], signals=businessSignals(), sectorValues={};
  companies.forEach(company=>{const value=Math.abs((state.holdings[company.ticker]||0)*company.price); sectorValues[company.sector]=(sectorValues[company.sector]||0)+value;});
  const portfolio=portfolioValue(), largestSector=Math.max(0,...Object.values(sectorValues));
  if (c.bondDebt>20 && c.dailyOperatingProfit*240<c.bondDebt*c.bondRate*1.5) return {title:"Capital structure warning",text:"Your capital structure is becoming risky because debt is rising faster than operating profit. Protect cash before adding more bonds."};
  if (signals.bottleneck.includes("higher than retail")) return {title:"Supply chain bottleneck",text:"Your supply chain has a bottleneck. Factory output is higher than retail capacity, so expansion may trap cash in inventory."};
  if (portfolio>0 && largestSector/portfolio>.65) return {title:"Portfolio concentration",text:"Your portfolio is overexposed to one market sector. A sector shock could hit both price and liquidity at the same time."};
  if (c.companyCash<6 && c.totalShares<1000000) return {title:"Buyback trade-off",text:"Your buyback improved earnings per share, but reduced available cash. Watch liquidity before the next expansion."};
  if (c.dailyRevenue>0 && c.dailyOperatingProfit/c.dailyRevenue<.08) return {title:"Margin pressure",text:"Your expansion is increasing revenue, but margins are falling. Recheck pricing, production cost, and discretionary budgets."};
  return {title:"Expert operating brief",text:`${signals.bottleneck} Demand is ${Math.round(signals.demand*100)}%, satisfaction is ${signals.satisfaction}/100, and brand strength is ${signals.brand}/100.`};
}

function renderAdvisor() {
  const panel=document.querySelector("#advisor");
  panel.classList.toggle("hidden",state.advisorHidden);
  const mission=currentMission();
  if (mission) {
    const number=learningMissions.findIndex(item=>item.id===mission.id)+1;
    const completed=state.missions.completed.includes(mission.id);
    document.querySelector("#advisor-title").textContent=completed?`Completed: ${mission.title}`:`Task help: ${mission.title}`;
    document.querySelector("#advisor-text").textContent=completed?`You passed challenge ${number}. Pick another task from the dropdown, or keep playing freely.`:`Optional challenge ${number}: ${mission.description}`;
    document.querySelector("#advisor-progress").textContent=`Open play task ${number} of ${learningMissions.length}`;
    document.querySelector("#advisor-next").textContent="Advanced brief";
    return;
  }
  const tip=advisorTips[Math.min(state.advisorStep,advisorTips.length-1)];
  document.querySelector("#advisor-title").textContent=tip.title;
  document.querySelector("#advisor-text").textContent=tip.text;
  document.querySelector("#advisor-progress").textContent=`Tip ${state.advisorStep+1} of ${advisorTips.length}`;
  document.querySelector("#advisor-next").textContent=state.advisorStep===advisorTips.length-1?"Finish guide":"Next tip";
}

function nextAdvisorTip() {
  const tip=expertAdvisorTip();
  document.querySelector("#advisor-title").textContent=tip.title;
  document.querySelector("#advisor-text").textContent=tip.text;
  document.querySelector("#advisor-progress").textContent="Advanced advisor";
  document.querySelector("#advisor-next").textContent="Refresh brief";
  return;
}

function renderCampaign() {
  const c=companies[0], s=difficultySettings(), daysLeft=Math.max(0,CAMPAIGN_DAYS-state.day), yearsLeft=Math.floor(daysLeft/TRADING_DAYS_PER_YEAR), remainder=daysLeft%TRADING_DAYS_PER_YEAR;
  document.querySelector("#campaign-status").textContent=state.gameOver?"Campaign ended":`${yearsLeft}y ${remainder}d remaining`;
  const objectives=[
    ["Personal net worth",money.format(accountEquity()),accountEquity()>=s.targetWorth,`Target ${money.format(s.targetWorth)}`],
    ["Nova market share",pct(c.marketShare),c.marketShare>=s.targetShare,`Target ${pct(s.targetShare)}`],
    ["Company liquidity",`$${c.companyCash.toFixed(2)}m`,c.companyCash>0,"Stay above $0"],
    ["Voting control",pct(votingOwnership()),hasControl(),"Keep above 50%"]
  ];
  document.querySelector("#objective-list").innerHTML=objectives.map(o=>`<div class="objective"><span>${o[0]} &middot; ${o[3]}</span><strong class="${o[2]?"up":"down"}">${o[1]}</strong></div>`).join("");
  document.querySelector("#next-day").disabled=state.gameOver;
  document.querySelector("#next-week").disabled=state.gameOver;
  document.querySelector("#next-month").disabled=state.gameOver;
}

function renderEconomy() {
  const e=state.economy;
  document.querySelector("#economic-regime").textContent=e.regime;
  const positive=e.growth>0&&e.confidence>=90&&e.inflation<.05;
  document.querySelector("#economy-outlook").textContent=positive?"Risk appetite healthy":e.growth<0?"Defensive conditions":"Mixed conditions";
  document.querySelector("#economy-outlook").className=positive?"up":e.growth<0?"down":"";
  const values=[
    ["Policy rate",pct(e.interestRate),e.interestRate<.06],
    ["Inflation",pct(e.inflation),e.inflation<.04],
    ["GDP growth",pct(e.growth),e.growth>0],
    ["Confidence",e.confidence.toFixed(0),e.confidence>=90],
    ["Fuel index",e.fuelIndex.toFixed(1),e.fuelIndex<120]
  ];
  document.querySelector("#economy-kpis").innerHTML=values.map(v=>`<div><span>${v[0]}</span><strong class="${v[2]?"up":"down"}">${v[1]}</strong></div>`).join("");
  document.querySelector("#market-ripples").innerHTML=state.marketRipples.length?state.marketRipples.slice(0,3).map(ripple=>{
    const effects=ripple.effects.map(effect=>`<span class="${effect.impact>=0?"up":"down"}">${effect.ticker} ${pct(effect.impact)}</span>`).join("");
    const rates=ripple.rateShift?`<span class="${ripple.rateShift>0?"down":"up"}">Rates ${pct(ripple.rateShift)}</span>`:"";
    return `<article class="ripple-card"><header><strong class="${ripple.impact>=0?"up":"down"}">${ripple.source} ${pct(ripple.impact)}</strong><time>DAY ${ripple.day}</time></header><p>${ripple.headline}</p><div class="ripple-effects">${effects}${rates}</div></article>`;
  }).join(""):`<p style="color:var(--muted)">Company shocks and their secondary market effects will appear here.</p>`;
}

function renderActivity() {
  document.querySelector("#open-orders").innerHTML=state.openOrders.length
    ? state.openOrders.map(o=>{const type=(o.type||"limit").toUpperCase(),prices=[o.stop?`S ${money.format(o.stop)}`:"",o.limit?`L ${money.format(o.limit)}`:""].filter(Boolean).join(" / ");return `<div class="activity-row"><span><strong>${o.ticker}</strong><small>${o.side.toUpperCase()} ${type}${o.triggered&&o.type?.startsWith("stop")?" - TRIGGERED":""}</small></span><span>${o.quantity} shares</span><span>${prices}</span><button data-cancel-order="${o.id}">Cancel</button></div>`}).join("")
    : `<p style="padding:18px 4px;color:var(--muted)">No open conditional orders.</p>`;
  document.querySelectorAll("[data-cancel-order]").forEach(button=>button.onclick=()=>{
    state.openOrders=state.openOrders.filter(order=>order.id!==+button.dataset.cancelOrder);
    addLedger("Canceled limit order",0); render();
  });
  document.querySelector("#ledger").innerHTML=state.ledger.length
    ? state.ledger.map(item=>`<div class="ledger-row"><time>DAY ${item.day}</time><span>${item.text}</span><span class="${item.amount>0?"up":item.amount<0?"down":""}">${item.amount?money.format(item.amount):""}</span></div>`).join("")
    : `<p style="padding:18px 4px;color:var(--muted)">Trades, dividends, and order activity will appear here.</p>`;
}

function renderOperations() {
  const c=companies[0], selected=c.products[state.selectedProduct]?.active?c.products[state.selectedProduct]:c.products.find(p=>p.active), selectedIndex=c.products.indexOf(selected);
  state.selectedProduct=selectedIndex;
  const pending=c.pendingDecisions?.productIndex===selectedIndex?c.pendingDecisions:null;
  const product=pending?.product||selected;
  const controls={"product-price":product.price,"production":product.production,"marketing":product.marketing,"research":pending?.research??c.research};
  Object.entries(controls).forEach(([id,value])=>{const input=document.querySelector(`#${id}`);if(document.activeElement!==input)input.value=value;});
  document.querySelector("#active-product-name").textContent=`Managing ${selected.name} - ${selected.segment} segment`;
  refreshDecisionLabels(false);
  const activeProduction=c.products.filter(p=>p.active).reduce((sum,p)=>sum+p.production,0);
  const values=[
    ["Company cash",`$${c.companyCash.toFixed(2)}m`,c.companyCash>=5],
    ["Units sold",c.dailySales.toLocaleString(),c.dailySales>=activeProduction*.8],
    ["Inventory",c.inventory.toLocaleString(),c.inventory<5000],
    ["Daily profit",`${c.dailyOperatingProfit>=0?"+":""}$${c.dailyOperatingProfit.toFixed(2)}m`,c.dailyOperatingProfit>=0],
    ["Portfolio quality",`${Math.round(c.quality*100)} / 175`,c.quality>=1],
    ["Customer satisfaction",`${Math.round(c.customerSatisfaction ?? 72)} / 100`,(c.customerSatisfaction ?? 72)>=60],
    ["Brand score",`${Math.round(c.brandScore ?? 68)} / 100`,(c.brandScore ?? 68)>=55],
    ["Market share",pct(c.marketShare),c.marketShare>=.15]
  ];
  document.querySelector("#operations-kpis").innerHTML=values.map(v=>`<div><span>${v[0]}</span><strong class="${v[2]?"up":"down"}">${v[1]}</strong></div>`).join("");
  let advice="Operations are balanced.";
  if(c.inventory>5000) advice="Inventory is piling up. Reduce production or lower the product price.";
  else if(c.dailySales>0 && c.inventory<300) advice="Demand is outrunning supply. Increase production or test a higher price.";
  else if(c.dailyOperatingProfit<0) advice="The company is losing money. Review production and discretionary budgets.";
  else if(c.companyCash<5) advice="Cash is tight. Protect liquidity before funding aggressive growth.";
  document.querySelector("#management-advice").textContent=advice;
  document.querySelector("#apply-decisions").disabled=!hasControl();
  renderManagementPreview(false);
  renderProducts();
}

function managementInputs() {
  return {
    price:+document.querySelector("#product-price").value,
    production:+document.querySelector("#production").value,
    marketing:+document.querySelector("#marketing").value,
    research:+document.querySelector("#research").value
  };
}

function estimateManagementImpact(product, inputs) {
  const c=companies[0], settings=difficultySettings(), activeCount=Math.max(1,c.products.filter(p=>p.active).length);
  // GAME BALANCE TUNING:
  // Keep this preview formula aligned with runPlayerCompany(), but without random demand noise.
  // This is what teaches the player how price, marketing, production, and inventory affect profit.
  const macroDemand=clamp(state.economy.confidence/100*(1+(state.economy.growth-.02)*3)*settings.demandMultiplier,.5,1.45);
  const relativePrice=product.competitorPrice/Math.max(1,inputs.price);
  const priceAppeal=clamp(relativePrice**settings.priceSensitivity,.32,1.85);
  const marketingLift=1+Math.sqrt(inputs.marketing/100)*settings.marketingEfficiency;
  const qualityLift=clamp(.72+product.quality*.28,.7,1.24);
  const demand=Math.max(60,Math.round(product.marketPotential*priceAppeal*marketingLift*qualityLift*macroDemand));
  const inflatedUnitCost=product.unitCost*(1+Math.max(-.02,state.economy.inflation)*1.35)*settings.costPressure;
  const cashReserve=c.companyCash*1000000*settings.cashReserveRatio;
  const produced=Math.min(inputs.production,Math.max(0,Math.floor((c.companyCash*1000000-cashReserve)/(inflatedUnitCost||1))));
  const available=product.inventory+produced;
  const sold=Math.min(available,demand);
  const revenue=sold*inputs.price/1000000;
  const endingInventory=available-sold;
  const holdingCost=endingInventory*product.unitCost*settings.inventoryHoldingRate/1000000;
  const cost=produced*inflatedUnitCost/1000000+(inputs.marketing+inputs.research/activeCount)/1000+settings.fixedOperatingCost+holdingCost;
  const profit=revenue-cost;
  const qualityGain=inputs.research/12000;
  return {demand,produced,sold,profit,endingInventory,qualityGain};
}

function renderManagementPreview(applied=false) {
  const box=document.querySelector("#management-feedback");
  if (!box) return;
  const c=companies[0], product=c.products[state.selectedProduct] || c.products.find(item=>item.active);
  if (!product) { box.innerHTML=""; return; }
  const inputs=managementInputs(), estimate=estimateManagementImpact(product,inputs);
  const demandWidth=Math.min(100,Math.round(estimate.demand/product.marketPotential*70));
  const productionWidth=Math.min(100,Math.round(estimate.produced/Math.max(1,inputs.production)*100));
  const profitWidth=Math.max(4,Math.min(100,Math.round((estimate.profit+1)*35)));
  const inventoryWidth=Math.min(100,Math.round(estimate.endingInventory/Math.max(1,product.marketPotential*8)*100));
  const profitClass=estimate.profit>=0?"up":"down";
  box.innerHTML=`<h3>${applied?"Applied strategy":"Expected next-day impact"}</h3>
    <div class="impact-grid">
      <div class="impact-card"><span>Demand forecast<strong>${estimate.demand.toLocaleString()}</strong></span><div class="impact-bar"><i style="--w:${demandWidth}%"></i></div></div>
      <div class="impact-card"><span>Production plan<strong>${estimate.produced.toLocaleString()}</strong></span><div class="impact-bar"><i style="--w:${productionWidth}%"></i></div></div>
      <div class="impact-card"><span>Profit estimate<strong class="${profitClass}">${estimate.profit>=0?"+":""}$${estimate.profit.toFixed(2)}m</strong></span><div class="impact-bar"><i style="--w:${profitWidth}%"></i></div></div>
      <div class="impact-card"><span>Ending inventory<strong>${estimate.endingInventory.toLocaleString()}</strong></span><div class="impact-bar"><i style="--w:${inventoryWidth}%"></i></div></div>
    </div>
    <p class="impact-note">Research adds about +${(estimate.qualityGain*100).toFixed(2)} quality points per day. Advance time to turn this forecast into actual sales.</p>`;
}

function renderProducts() {
  const c=companies[0];
  document.querySelector("#product-list").innerHTML=c.products.map((product,index)=>{
    if (!product.active) return `<article class="product-card"><header><div><h3>${product.name}</h3><span>${product.segment} segment</span></div><strong>LOCKED</strong></header><p>Launch cost: $${product.launchCost}m. Initial unit cost: ${money.format(product.unitCost)}.</p><button data-launch-product="${index}" ${!hasControl()?"disabled":""}>Launch ${product.name}</button></article>`;
    const priceGap=product.price/product.competitorPrice-1;
    return `<article class="product-card ${index===state.selectedProduct?"selected":""}"><header><div><h3>${product.name}</h3><span>${product.segment} segment</span></div><strong class="${priceGap<=0?"up":"down"}">${priceGap<=0?"VALUE":"PREMIUM"}</strong></header><div class="product-stats"><span>Nova price<strong>${money.format(product.price)}</strong></span><span>Competitor<strong>${money.format(product.competitorPrice)}</strong></span><span>Daily sales<strong>${product.dailySales.toLocaleString()}</strong></span><span>Inventory<strong>${product.inventory.toLocaleString()}</strong></span><span>Quality<strong>${Math.round(product.quality*100)} / 175</strong></span><span>Unit cost<strong>${money.format(product.unitCost)}</strong></span></div><button data-select-product="${index}">${index===state.selectedProduct?"Currently managing":"Manage product"}</button></article>`;
  }).join("");
  document.querySelectorAll("[data-select-product]").forEach(button=>button.onclick=()=>{state.selectedProduct=+button.dataset.selectProduct;render();});
  document.querySelectorAll("[data-launch-product]").forEach(button=>button.onclick=()=>launchProduct(+button.dataset.launchProduct));
}

function guideClassForProduct(key) {
  return productClasses.find(group=>group.items.includes(key)) || productClasses[0];
}

function recommendedShopType(key) {
  const picks={
    fuel:"gasStation",coffee:"bakery",pastries:"bakery",bread:"bakery",cheese:"groceryShop",softDrinks:"groceryShop",
    medicine:"pharmacy",cosmetics:"pharmacy",phones:"electronicsShop",computers:"electronicsShop",printers:"electronicsShop",appliances:"homeShop",
    shirts:"fashionShop",babyClothes:"fashionShop",leatherJackets:"fashionShop",petFood:"petShop",books:"bookShop",jewelry:"jewelryShop",cleaningGoods:"homeShop"
  };
  return picks[key] || "store";
}

function renderManufacturerGuide() {
  const classList=document.querySelector("#guide-classes"), productList=document.querySelector("#guide-products"), detail=document.querySelector("#guide-detail");
  if (!classList || !productList || !detail) return;
  let group=productClasses.find(item=>item.id===guideState.productClass) || productClasses[0];
  if (!group.items.includes(guideState.product)) guideState.product=group.items[0];
  const line=productLines[guideState.product], shopType=recommendedShopType(guideState.product), shop=facilityBlueprints[shopType];
  const grossMargin=(line.unitPrice-line.unitCost)/line.unitPrice;
  const techHeavy=["computers","phones","medicine","printers","appliances"].includes(guideState.product);
  const productionQuality=techHeavy?.35:.2;
  const rawQuality=1-productionQuality;
  classList.innerHTML=productClasses.map(item=>`<button class="${item.id===group.id?"active":""}" data-guide-class="${item.id}"><span>${item.name}</span><strong>${item.items.length}</strong></button>`).join("");
  productList.innerHTML=group.items.map(key=>`<button class="${key===guideState.product?"active":""}" data-guide-product="${key}"><span>${productLines[key].name}</span><small>${productLines[key].input} -> ${productLines[key].output}</small></button>`).join("");
  detail.innerHTML=`<div class="guide-recipe-card">
    <div class="guide-card-main">
      <div class="guide-product-art"><span>${line.name.slice(0,2).toUpperCase()}</span></div>
      <div><p class="eyebrow">MANUFACTURER'S GUIDE</p><h3>${line.name}</h3><span>${group.name}</span></div>
    </div>
    <div class="guide-flow">
      <div><strong>${line.input}</strong><span>1 unit raw input</span></div>
      <i></i>
      <div><strong>${line.output}</strong><span>Factory output</span></div>
      <i></i>
      <div><strong>${shop.name}</strong><span>Recommended seller</span></div>
    </div>
    <div class="guide-quality">
      <h3>Quality is determined by</h3>
      <p><span>Production Tech</span><strong>${Math.round(productionQuality*100)}%</strong></p>
      <p><span>Raw Material Quality</span><strong>${Math.round(rawQuality*100)}%</strong></p>
      <p><span>Tech Known to You</span><strong class="up">Yes</strong></p>
    </div>
    <div class="guide-stats">
      <span>Unit cost<strong>${money.format(line.unitCost)}</strong></span>
      <span>Retail price<strong>${money.format(line.unitPrice)}</strong></span>
      <span>Gross margin<strong>${Math.round(grossMargin*100)}%</strong></span>
      <span>Market size<strong>${line.market.toLocaleString()} demand/day</strong></span>
    </div>
    <div class="guide-build-path">
      <strong>Suggested build path</strong>
      <p>1. Build Raw-material Industry for ${line.input}. 2. Build Factory for ${line.output}. 3. Build ${shop.name} to sell it.</p>
    </div>
  </div>`;
  classList.querySelectorAll("[data-guide-class]").forEach(button=>button.onclick=()=>{guideState.productClass=button.dataset.guideClass;guideState.product=(productClasses.find(x=>x.id===guideState.productClass)||productClasses[0]).items[0];renderManufacturerGuide();});
  productList.querySelectorAll("[data-guide-product]").forEach(button=>button.onclick=()=>{guideState.product=button.dataset.guideProduct;guideState.productClass=guideClassForProduct(guideState.product).id;renderManufacturerGuide();});
  document.querySelector("#guide-status").textContent=`${line.input} -> ${line.output}`;
}

function renderSparkBars(value,positive=true) {
  return Array.from({length:12},(_,index)=>{
    const height=Math.max(8,Math.min(100,18+index*5+Math.sin((state.day+index)/2)*18+(positive?value*12:-value*10)));
    return `<b style="height:${height}%"></b>`;
  }).join("");
}

function renderFirmView() {
  const identity=document.querySelector("#firm-identity");
  if (!identity) return;
  ensureStateDefaults();
  const facility=state.facilities.find(item=>item.id===state.selectedFacilityId);
  const slots=document.querySelector("#firm-product-slots"), info=document.querySelector("#firm-info"), building=document.querySelector("#firm-building");
  if (!facility) {
    identity.innerHTML="<strong>No firm selected</strong><span>Build a facility to open the firm operations screen.</span>";
    document.querySelector("#firm-profit").textContent="$0";
    document.querySelector("#firm-revenue").textContent="$0";
    document.querySelector("#firm-profit-spark").innerHTML=renderSparkBars(0);
    document.querySelector("#firm-revenue-spark").innerHTML=renderSparkBars(0);
    slots.innerHTML="<div class=\"firm-empty\">No product slots yet.</div>";
    info.innerHTML="<p>Select or build a facility to manage products, marketing, upgrades, and exits.</p>";
    building.className="firm-building";
    return;
  }
  const line=productLines[facility.line], blueprint=facilityBlueprints[facility.type], role=facilityRole(facility.type), metrics=facilityMarketMetrics(facility);
  const revenue=Math.max(0,facility.lastUnits*line.unitPrice/1000000), profit=facility.profit||0;
  identity.innerHTML=`${playerBrandMarkup(true)}<div><strong>${facilityLabel(facility)}</strong><span>${blueprint.role}</span></div>`;
  document.querySelector("#firm-profit").textContent=`${profit>=0?"+":""}$${profit.toFixed(3)}m`;
  document.querySelector("#firm-profit").className=profit>=0?"up":"down";
  document.querySelector("#firm-revenue").textContent=`$${revenue.toFixed(3)}m`;
  document.querySelector("#firm-profit-spark").innerHTML=renderSparkBars(profit,profit>=0);
  document.querySelector("#firm-revenue-spark").innerHTML=renderSparkBars(revenue,true);
  const productSlots=[
    {name:line.input,label:"Input",units:role==="industry"?facility.rawInventory:facility.rawInventory,quality:70},
    {name:line.output,label:role==="industry"?"Extracted":"Output",units:role==="store"?facility.finishedInventory:facility.lastUnits,quality:Math.min(95,55+facility.level*8)},
    {name:"Marketing",label:"Demand",units:facility.marketing,quality:Math.min(100,facility.marketing)},
    {name:"Service",label:"Store quality",units:facility.level,quality:Math.min(100,45+facility.level*14)}
  ];
  slots.innerHTML=productSlots.map(slot=>`<article class="firm-slot"><div class="firm-slot-art">${slot.name.slice(0,2).toUpperCase()}</div><div><strong>${slot.name}</strong><span>${slot.label}</span><small>${Number(slot.units).toLocaleString()} units</small></div><i style="--q:${slot.quality}%"></i></article>`).join("");
  building.className=`firm-building firm-${role}`;
  info.innerHTML=`<h3>${blueprint.name}</h3><p>${line.input} -> ${line.output}</p>
    <div class="firm-info-grid">
      <span>Level<strong>${facility.level}</strong></span>
      <span>Last units<strong>${facility.lastUnits.toLocaleString()}</strong></span>
      <span>Inventory<strong>${metrics.stock.toLocaleString()}</strong></span>
      <span>Capacity<strong>${metrics.capacity.toLocaleString()}/day</strong></span>
    </div>
    <div class="firm-economics">
      <h3>Market economics</h3>
      <div class="firm-economics-grid">
        <span>Your price<strong>${money.format(line.unitPrice)}</strong></span>
        <span>Competitor price<strong>${money.format(metrics.competitorPrice)}</strong></span>
        <span>Unit cost<strong>${money.format(metrics.unitCost)}</strong></span>
        <span>Gross margin<strong class="${metrics.grossMargin>=.25?"up":"down"}">${pct(metrics.grossMargin)}</strong></span>
        <span>Demand forecast<strong>${metrics.demand.toLocaleString()}</strong></span>
        <span>Break-even units<strong>${metrics.breakEvenUnits.toLocaleString()}</strong></span>
        <span>Possible sales<strong>${metrics.possibleUnits.toLocaleString()}</strong></span>
        <span>Profit forecast<strong class="${metrics.estimatedProfit>=0?"up":"down"}">${metrics.estimatedProfit>=0?"+":""}$${metrics.estimatedProfit.toFixed(3)}m</strong></span>
      </div>
      <p>${facilityAdvice(metrics)}</p>
    </div>`;
  document.querySelector("#firm-upgrade").onclick=()=>upgradeFacility(facility.id);
  document.querySelector("#firm-market").onclick=()=>marketFacility(facility.id);
  document.querySelector("#firm-sell").onclick=()=>sellFacility(facility.id,false);
  document.querySelector("#firm-demolish").onclick=()=>sellFacility(facility.id,true);
}

function renderFacilities() {
  ensureStateDefaults();
  const list=document.querySelector("#facility-list");
  if (!list) return;
  const company=companies[0];
  document.querySelector("#empire-status").textContent=state.facilities.length?`${state.facilities.length} facilities operating`:"Build your first factory, store, or industry";
  list.innerHTML=state.facilities.length?state.facilities.map(facility=>{
    const line=productLines[facility.line], blueprint=facilityBlueprints[facility.type];
    const metrics=facilityMarketMetrics(facility);
    const kpis=[
      ["Level",facility.level],
      ["Last units",facility.lastUnits.toLocaleString()],
      ["Marketing",`$${facility.marketing}k/day`],
      ["Last profit",`$${facility.profit.toFixed(3)}m`],
      ["Competitor",money.format(metrics.competitorPrice)],
      ["Margin",pct(metrics.grossMargin)]
    ].map(item=>`<span>${item[0]}<strong>${item[1]}</strong></span>`).join("");
    const stock=facilityRole(facility.type)==="industry"?`${facility.rawInventory.toLocaleString()} ${line.input}`:`${facility.finishedInventory.toLocaleString()} ${line.output}`;
    return `<article class="facility-card ${facility.id===state.selectedFacilityId?"selected":""}" data-select-facility="${facility.id}"><h3>${facilityLabel(facility)}</h3><small>${blueprint.role}</small><div class="facility-kpis">${kpis}<span>Stock<strong>${stock}</strong></span><span>Demand<strong>${metrics.demand.toLocaleString()}</strong></span></div><button data-upgrade-facility="${facility.id}">Upgrade ($${4+facility.level*3}m)</button><button data-market-facility="${facility.id}">Marketing +$20k/day ($1m)</button></article>`;
  }).join(""):`<div class="builder-card"><h3>No facilities yet</h3><p>Start small: build an industry for raw materials, a factory to make goods, and a store to sell them.</p></div>`;
  document.querySelectorAll("[data-select-facility]").forEach(card=>card.onclick=event=>{if(event.target.tagName==="BUTTON")return;state.selectedFacilityId=+card.dataset.selectFacility;render();});
  document.querySelectorAll("[data-upgrade-facility]").forEach(button=>button.onclick=()=>upgradeFacility(+button.dataset.upgradeFacility));
  document.querySelectorAll("[data-market-facility]").forEach(button=>button.onclick=()=>marketFacility(+button.dataset.marketFacility));
  const supply=document.querySelector("#supply-chain");
  supply.innerHTML=Object.entries(productLines).map(([key,line])=>{
    const count=state.facilities.filter(f=>f.line===key).length;
    return `<div class="supply-card"><strong>${line.name}</strong><p>${line.input} -> ${line.output}. ${count} owned facility${count===1?"":"ies"}.</p></div>`;
  }).join("");
  document.querySelector("#build-facility").disabled=!hasControl() || company.companyCash<Math.min(...Object.values(facilityBlueprints).map(x=>x.cost));
  renderFirmView();
  renderManufacturerGuide();
}

function renderFinance() {
  const c=companies[0], ownership=votingOwnership(), controlled=hasControl();
  const publicShares=c.totalShares-c.founderShares;
  document.querySelector("#control-status").textContent=controlled?"Board controlled":"Control lost";
  document.querySelector("#control-status").className=controlled?"up":"down";
  const values=[
    ["Voting ownership",pct(ownership),controlled],
    ["Founder shares",c.founderShares.toLocaleString(),true],
    ["Portfolio votes",Math.max(0,state.holdings[c.ticker]||0).toLocaleString(),true],
    ["Shares outstanding",c.totalShares.toLocaleString(),c.totalShares<=1100000],
    ["Public shares",publicShares.toLocaleString(),true],
    ["Bond debt",`$${c.bondDebt.toFixed(1)}m`,c.bondDebt<20],
    ["Average coupon",pct(c.bondRate),c.bondRate<.07],
    ["Daily interest",`$${c.dailyInterest.toFixed(3)}m`,c.dailyInterest<.005],
    ["Company cash",`$${c.companyCash.toFixed(2)}m`,c.companyCash>=5]
    ,["Strategic assets",`$${acquisitionAssetValue().toFixed(2)}m`,acquisitionAssetValue()>0]
  ];
  document.querySelector("#finance-kpis").innerHTML=values.map(v=>`<div><span>${v[0]}</span><strong class="${v[2]?"up":"down"}">${v[1]}</strong></div>`).join("");
  document.querySelectorAll("[data-finance-action]").forEach(button=>button.disabled=!controlled);
  if(!controlled && !document.querySelector("#finance-message").textContent) financeMessage("Buy additional Nova shares in the market to rebuild a majority voting stake.",false);
}

function renderTakeovers() {
  const synergies={
    GRNW:"Energy integration lowers long-run operating risk.",
    HARB:"Retail distribution strengthens consumer reach.",
    AXIS:"Owned logistics improves supply-chain efficiency.",
    MEDI:"Research expertise accelerates product quality gains."
  };
  document.querySelector("#takeover-status").textContent=featureUnlocked("ma")?(state.takeoverNotice||"No active takeover campaign"):"LOCKED - reach $145k or day 90";
  document.querySelector("#takeover-targets").innerHTML=companies.slice(1).map(target=>{
    const cost=takeoverBlockCost(target), sellValue=target.price*target.totalShares/1000000*.1*.95;
    return `<article class="takeover-card">
      <header><div><h3>${target.name}</h3><span>${target.ticker} &middot; ${target.sector}</span></div><strong class="${target.controlled?"up":""}">${target.controlled?"SUBSIDIARY":"INDEPENDENT"}</strong></header>
      <div class="stake-bar"><i style="width:${target.novaStake*200}%"></i></div>
      <div class="takeover-meta"><span>Nova stake<strong>${pct(target.novaStake)}</strong></span><span>Defense premium<strong>${pct(target.takeoverDefense)}</strong></span><span>Next 10%<strong>${money.format(cost*1000000)}</strong></span></div>
      <div class="takeover-actions"><button data-buy-target="${target.ticker}" ${target.controlled||!hasControl()||!featureUnlocked("ma")?"disabled":""}>Buy 10%</button><button data-sell-target="${target.ticker}" ${target.novaStake<.1?"disabled":""}>Sell 10% (${money.format(sellValue*1000000)})</button></div>
      <p>${synergies[target.ticker]}</p>
    </article>`;
  }).join("");
  document.querySelectorAll("[data-buy-target]").forEach(button=>button.onclick=()=>buyTakeoverBlock(button.dataset.buyTarget));
  document.querySelectorAll("[data-sell-target]").forEach(button=>button.onclick=()=>sellTakeoverBlock(button.dataset.sellTarget));
}

function refreshDecisionLabels(markDirty=true) {
  document.querySelector("#product-price-value").textContent=money.format(+document.querySelector("#product-price").value);
  document.querySelector("#production-value").textContent=`${(+document.querySelector("#production").value).toLocaleString()} units`;
  document.querySelector("#marketing-value").textContent=`$${document.querySelector("#marketing").value}k/day`;
  document.querySelector("#research-value").textContent=`$${document.querySelector("#research").value}k/day`;
  renderManagementPreview(false);
  if(markDirty) {
    document.querySelector("#operations-status").textContent="Preview updated";
    const button=document.querySelector("#apply-decisions");
    if (button) button.textContent="Apply management decisions";
  }
}

function updateEstimate(){
  const c=companies[state.selected],qty=Math.max(0,+document.querySelector("#quantity").value||0);
  document.querySelector("#terminal-symbol").textContent=`${c.ticker} ${money.format(c.price)}`;
  if (state.orderType!=="market") {
    const limit=+document.querySelector("#limit-price").value||c.price;
    const reference=state.orderType==="stop"?+document.querySelector("#stop-price").value||c.price:limit;
    document.querySelector("#estimate").textContent=money.format(qty*reference);
    document.querySelector("#trade").textContent=`Place ${state.side} ${state.orderType} order`;
    return;
  }
  const book=state.side==="buy"?c.book.asks:c.book.bids;let left=qty,total=0;
  for(const o of book){const n=Math.min(left,o.quantity);total+=n*o.price;left-=n;if(!left)break;}
  document.querySelector("#estimate").textContent=left?"Insufficient liquidity":money.format(total);
  document.querySelector("#trade").textContent=`${state.side==="buy"?"Buy":"Sell"} ${qty||""} shares`;
}

function bootstrapSavedMode() {
  const savedMode=localStorage.getItem(MODE_KEY);
  state.mode=savedMode==="expert"?"expert":"guided";
  ensureMissionDefaults();
  updateLocalSaveStatus();
}

companies.forEach(seedBook);
document.querySelector("#next-day").onclick=()=>runDays(1); document.querySelector("#next-week").onclick=()=>runDays(5); document.querySelector("#next-month").onclick=()=>runDays(20);
document.querySelector("#audio-toggle").onclick=toggleAudio;
document.querySelector("#time-toggle").onclick=toggleTime;
document.querySelector("#time-speed").onchange=event=>{ensureStateDefaults();state.autoTime.speed=+event.target.value||1;state.autoTime.accumulator=0;};
document.querySelector("#show-advisor").onclick=()=>{state.advisorHidden=false;render();}; document.querySelector("#advisor-dismiss").onclick=()=>{state.advisorHidden=true;render();}; document.querySelector("#advisor-next").onclick=nextAdvisorTip;
document.querySelector("#trade").onclick=executeTrade; document.querySelector("#quantity").oninput=updateEstimate; document.querySelector("#limit-price").oninput=updateEstimate; document.querySelector("#stop-price").oninput=updateEstimate;
document.querySelector("#buy-option").onclick=buyOption; document.querySelector("#option-strike").onchange=render; document.querySelector("#option-expiry").onchange=render; document.querySelector("#option-contracts").oninput=render;
document.querySelectorAll("[data-option-type]").forEach(button=>button.onclick=()=>{state.optionType=button.dataset.optionType;document.querySelectorAll("[data-option-type]").forEach(b=>b.classList.toggle("active",b===button));render();});
document.querySelector("#save-game").onclick=saveGame; document.querySelector("#load-game").onclick=loadGame; document.querySelector("#new-game").onclick=openLaunchModal; document.querySelector("#modal-button").onclick=()=>newGame(true,"guided");
document.querySelector("#cloud-save").onclick=cloudSaveGame; document.querySelector("#cloud-load").onclick=cloudLoadGame;
document.querySelector("#profile-save").onclick=saveProfileLocally; document.querySelector("#profile-close").onclick=closeSaveProfile;
document.querySelector("#launch-start").onclick=()=>newGame(true,"guided");
document.querySelector("#launch-expert").onclick=()=>startExpertMode(false);
document.querySelector("#launch-load").onclick=()=>loadGame();
document.querySelector("#launch-email-load").onclick=cloudLoadGame;
const launchExplore=document.querySelector("#launch-explore");
if (launchExplore) launchExplore.onclick=()=>{document.querySelector("#launch-modal").classList.add("hidden"); message("You are viewing the current board. Use Start new campaign whenever you want a clean run.",true);};
document.querySelector("#tutorial-next").onclick=nextTutorialStep;
document.querySelector("#tutorial-skip").onclick=finishTutorial;
document.querySelector("#difficulty").onchange=()=>{if(state.day>1)message("Difficulty applies when you start a new game.",false);};
document.querySelector("#build-facility").onclick=buildFacility;
document.querySelectorAll("[data-avatar]").forEach(button=>button.onclick=()=>{document.querySelectorAll("[data-avatar]").forEach(item=>item.classList.toggle("active",item===button));playCue("click");});
document.querySelectorAll("[data-logo]").forEach(button=>button.onclick=()=>{document.querySelectorAll("[data-logo]").forEach(item=>item.classList.toggle("active",item===button));playCue("click");});
document.querySelectorAll("[data-side]").forEach(button=>button.onclick=()=>{state.side=button.dataset.side;document.querySelectorAll("[data-side]").forEach(b=>b.classList.toggle("active",b===button));button.parentElement.classList.toggle("sell",state.side==="sell");updateEstimate();});
document.querySelector("#order-type-select").onchange=event=>{
  state.orderType=event.target.value;
  const usesLimit=state.orderType==="limit"||state.orderType==="stop-limit",usesStop=state.orderType==="stop"||state.orderType==="stop-limit",company=companies[state.selected];
  document.querySelector("#limit-price-label").classList.toggle("hidden",!usesLimit);
  document.querySelector("#stop-price-label").classList.toggle("hidden",!usesStop);
  if(usesLimit) document.querySelector("#limit-price").value=company.price.toFixed(2);
  if(usesStop) document.querySelector("#stop-price").value=(company.price*(state.side==="buy"?1.03:.97)).toFixed(2);
  updateEstimate();
};
document.querySelectorAll("[data-quick-size]").forEach(button=>button.onclick=()=>{
  const company=companies[state.selected],fraction=+button.dataset.quickSize,held=Math.max(0,state.holdings[company.ticker]||0);
  const maximum=state.side==="buy"?Math.floor(state.cash/company.price):(held||Math.floor(accountEquity()*1.25/company.price));
  document.querySelector("#quantity").value=Math.max(1,Math.floor(maximum*fraction));updateEstimate();
});
document.querySelector("#apply-decisions").onclick=applyManagementDecisions;
[...document.querySelectorAll("[data-finance-action]")].forEach(button=>button.onclick=()=>corporateFinanceAction(button.dataset.financeAction));
["product-price","production","marketing","research"].forEach(id=>document.querySelector(`#${id}`).oninput=()=>{markMissionInput(id);refreshDecisionLabels();});
document.querySelector("#task-select").onchange=event=>{ensureMissionDefaults();state.missions.selected=event.target.value;state.advisorHidden=false;render();};
window.addEventListener("keydown",handleKeyboard);
setupTouchControls();
window.addEventListener("resize",()=>renderChart(companies[state.selected])); bootstrapSavedMode(); render();
initCloud();
requestAnimationFrame(gameLoop);
