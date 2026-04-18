// ========== 生成星空粒子 + 金色光點 ==========
function createStars() {
  var container = document.getElementById('stars');

  // 白色星星
  for (var i = 0; i < 80; i++) {
    var star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    var size = Math.random() * 2 + 1;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.setProperty('--duration', (Math.random() * 4 + 2) + 's');
    star.style.setProperty('--max-opacity', (Math.random() * 0.6 + 0.2).toString());
    star.style.animationDelay = (Math.random() * 5) + 's';
    container.appendChild(star);
  }

  // 金色光點（散落裝飾）
  for (var j = 0; j < 8; j++) {
    var dot = document.createElement('div');
    dot.className = 'glow-dot';
    dot.style.left = (Math.random() * 90 + 5) + '%';
    dot.style.top = (Math.random() * 80 + 10) + '%';
    dot.style.setProperty('--duration', (Math.random() * 3 + 3) + 's');
    dot.style.setProperty('--max-opacity', (Math.random() * 0.4 + 0.3).toString());
    dot.style.animationDelay = (Math.random() * 4) + 's';
    container.appendChild(dot);
  }
}
createStars();

// ========== 全域變數 ==========
var throws = [];
var userZodiac = '';
var userAge = '';
var userQuestion = '';
var pendingMessage = '';

// ========== 八卦對照表 ==========
var trigramNames = {
  7: '乾', 3: '兌', 5: '離', 1: '震',
  6: '巽', 2: '坎', 4: '艮', 0: '坤'
};

var hexagramMap = {
  '乾乾': '乾為天', '乾兌': '天澤履', '乾離': '天火同人', '乾震': '天雷無妄',
  '乾巽': '天風姤', '乾坎': '天水訟', '乾艮': '天山遯', '乾坤': '天地否',
  '兌乾': '澤天夬', '兌兌': '兌為澤', '兌離': '澤火革', '兌震': '澤雷隨',
  '兌巽': '澤風大過', '兌坎': '澤水困', '兌艮': '澤山咸', '兌坤': '澤地萃',
  '離乾': '火天大有', '離兌': '火澤睽', '離離': '離為火', '離震': '火雷噬嗑',
  '離巽': '火風鼎', '離坎': '火水未濟', '離艮': '火山旅', '離坤': '火地晉',
  '震乾': '雷天大壯', '震兌': '雷澤歸妹', '震離': '雷火豐', '震震': '震為雷',
  '震巽': '雷風恆', '震坎': '雷水解', '震艮': '雷山小過', '震坤': '雷地豫',
  '巽乾': '風天小畜', '巽兌': '風澤中孚', '巽離': '風火家人', '巽震': '風雷益',
  '巽巽': '巽為風', '巽坎': '風水渙', '巽艮': '風山漸', '巽坤': '風地觀',
  '坎乾': '水天需', '坎兌': '水澤節', '坎離': '水火既濟', '坎震': '水雷屯',
  '坎巽': '水風井', '坎坎': '坎為水', '坎艮': '水山蹇', '坎坤': '水地比',
  '艮乾': '山天大畜', '艮兌': '山澤損', '艮離': '山火賁', '艮震': '山雷頤',
  '艮巽': '山風蠱', '艮坎': '山水蒙', '艮艮': '艮為山', '艮坤': '山地剝',
  '坤乾': '地天泰', '坤兌': '地澤臨', '坤離': '地火明夷', '坤震': '地雷復',
  '坤巽': '地風升', '坤坎': '地水師', '坤艮': '地山謙', '坤坤': '坤為地'
};

// ========== 本地六十四卦解讀資料庫 ==========
var hexagramInterpretations = {
  '乾為天': {
    fortune: '大吉',
    description: '六爻皆陽，龍行天下。天行健，自強不息——你現在氣場正旺，做什麼都有底氣，是全力衝刺的好時機。',
    advice: '大膽往前衝，但記住飛龍在天也怕亢龍有悔。得意時更要謙虛，別讓好運沖昏了頭。'
  },
  '坤為地': {
    fortune: '吉',
    description: '大地承載萬物，厚德載物。目前適合當幕後推手，用包容和耐心去成就大事。',
    advice: '別急著當主角，做好支援角色反而收穫最大。找個靠譜的人跟著走，配合大於單打。'
  },
  '水雷屯': {
    fortune: '小凶',
    description: '萬事起頭難。雷雨交加中冒出的新芽，充滿生命力但阻力也不小，目前正處在混沌初開的階段。',
    advice: '別心急，現在硬衝只會撞牆。先把基礎打穩，找到對的人幫忙，等雨停了再出門。'
  },
  '山水蒙': {
    fortune: '平',
    description: '像小孩子剛上學一樣，看不清方向很正常。山下有水，霧氣濛濛，需要有人指點迷津。',
    advice: '放下面子去請教有經驗的人，別自己瞎摸索。找個好老師、好前輩，事半功倍。'
  },
  '水天需': {
    fortune: '中吉',
    description: '雲升到天上，雨還沒下來——時機未到，但好事確實正在路上。就像等外送，急也沒用。',
    advice: '耐心等待，趁這段時間做好準備。機會來的時候你得接得住，養精蓄銳就對了。'
  },
  '天水訟': {
    fortune: '凶',
    description: '天往上走水往下流，方向相反——是非口舌多，容易跟人起衝突，爭到最後兩敗俱傷。',
    advice: '退一步海闊天空，能和解就和解。找個公正的中間人調停，別硬碰硬。'
  },
  '地水師': {
    fortune: '中吉',
    description: '帶兵打仗的卦。地中有水，暗藏力量，需要紀律和組織力才能發揮出來。',
    advice: '找對領頭的人很重要，別單打獨鬥。團隊作戰、服從大局、各司其職才是王道。'
  },
  '水地比': {
    fortune: '吉',
    description: '水在地上，親密相依。這是團結合作的好卦象，找到同頻的人互相扶持，力量加倍。',
    advice: '現在是交朋友、找合作夥伴的好時機。真心換真心，選對圈子比努力更重要。'
  },
  '風天小畜': {
    fortune: '平',
    description: '風在天上吹，雲聚了但雨還沒下。小有積蓄但還不夠，差一口氣就到了。',
    advice: '繼續存糧、練功，小步快跑。別因為差最後一點就放棄，堅持住就快突破了。'
  },
  '天澤履': {
    fortune: '中吉',
    description: '踩在老虎尾巴上卻沒被咬——有風險但能過關，靠的是做人的態度和分寸感。',
    advice: '做事小心謹慎，對人客氣有禮。即便遇到強勢的人或棘手的事，端正態度就能化險為夷。'
  },
  '地天泰': {
    fortune: '大吉',
    description: '天地交通、陰陽調和！上下一心，內外通達，這是萬事亨通的大好局面。',
    advice: '運勢正旺，把握當下大膽行動！但好運不是永遠的，趁順風多做事、多積福。'
  },
  '天地否': {
    fortune: '凶',
    description: '天地不交，上下隔閡。溝通斷裂、事情推不動，是閉塞停滯的時期。',
    advice: '現在不是硬幹的時候，守住底線就好。韜光養晦，記住否極泰來，撐過去就轉運了。'
  },
  '天火同人': {
    fortune: '吉',
    description: '火光照亮天空，志同道合的人被光芒吸引聚在一起。適合合作、社交、結盟。',
    advice: '多出去走動，參加聚會拓展人脈。貴人就在人群中，但合作要光明正大。'
  },
  '火天大有': {
    fortune: '大吉',
    description: '火在天上，光明普照！豐收之象，要什麼有什麼，是運勢的高光時刻。',
    advice: '運勢大好但要懂得分享，獨吞容易招嫉妒。慷慨一點，福氣才能更長久。'
  },
  '地山謙': {
    fortune: '大吉',
    description: '高山藏在地底下——有實力卻不張揚。謙卦是六十四卦裡最穩的，謙虛使人進步真不是空話。',
    advice: '放低姿態，少炫耀多做事。越謙虛運勢越好，這是天道最偏愛的品格。'
  },
  '雷地豫': {
    fortune: '吉',
    description: '雷從地底轟出，萬物歡欣鼓舞！做事有幹勁、心情也暢快，是愉悅順利的好兆頭。',
    advice: '趁熱情還在趕緊行動，但別光顧著嗨。快樂中也要有計畫，提前做好準備。'
  },
  '澤雷隨': {
    fortune: '中吉',
    description: '雷在澤下，順勢而行。跟隨大勢、隨機應變，現在不適合當開拓者，適合順水推舟。',
    advice: '觀察環境，跟對人、跟對趨勢。靈活變通比固執堅持好，識時務者為俊傑。'
  },
  '山風蠱': {
    fortune: '小凶',
    description: '山下起風，碗裡生蟲——有東西腐壞了需要清理。可能是爛帳、爛攤子或一段變質的關係。',
    advice: '別逃避，正面處理那個你一直拖著的問題。清理乾淨了運勢才能重新轉起來。'
  },
  '地澤臨': {
    fortune: '大吉',
    description: '大地俯身看著湖水，居高臨下。好運正在接近你，像春天快到了，萬物即將復甦。',
    advice: '機會正在靠近，做好準備迎接！但記住好運有時效，別磨蹭，該出手時就出手。'
  },
  '風地觀': {
    fortune: '平',
    description: '風吹過大地，登高望遠。現在是觀察期不是行動期，先看清楚全局再做決定。',
    advice: '別急著出手，先蒐集資訊、觀察風向。看準了再動，一擊必中勝過盲目亂衝。'
  },
  '火雷噬嗑': {
    fortune: '中吉',
    description: '嘴裡有東西咬不動——中間卡了障礙物，必須用力咬碎它才能合攏。問題就在那裡，繞不過去。',
    advice: '硬骨頭要啃就啃到底，半途而廢最虧。拿出魄力和決心解決那個卡住的問題。'
  },
  '山火賁': {
    fortune: '平',
    description: '山下有火，光彩照人。外表華麗漂亮，但要注意內在是否同樣扎實。',
    advice: '適當注重形象包裝是好的，但別本末倒置。裡子比面子重要，實力才是真底氣。'
  },
  '山地剝': {
    fortune: '凶',
    description: '一層一層被剝落，就像深秋的樹葉紛紛掉落。目前處在運勢低谷，根基在動搖。',
    advice: '守住不動！現在什麼都別冒險。保存實力等待翻盤，冬天總會過去的。'
  },
  '地雷復': {
    fortune: '吉',
    description: '一陽來復！地底下傳來第一聲春雷，黑暗到了盡頭，曙光初現，觸底反彈的訊號出來了。',
    advice: '轉運的跡象已經出現，但慢慢來。一步一步重新開始，別急著搞大動作。'
  },
  '天雷無妄': {
    fortune: '中吉',
    description: '天降雷聲，出乎意料。無妄就是不虛妄——老天看著呢，真誠做人做事自然有好結果，但會有意外。',
    advice: '別投機取巧，踏踏實實反而最順。遇到突發狀況保持冷靜，順其自然。'
  },
  '山天大畜': {
    fortune: '大吉',
    description: '高山裡藏著天的能量。大量儲備的好卦象——肚子裡有貨、帳戶裡有錢、腦子裡有料。',
    advice: '繼續積累實力，時候到了就是大爆發。也非常適合進修學習、投資自己。'
  },
  '山雷頤': {
    fortune: '平',
    description: '嘴巴的卦——上下兩個陽爻像嘴唇，中間空的像嘴巴。吃什麼、說什麼都要特別注意。',
    advice: '管住嘴，少說閒話多養身。身體是一切的本錢，飲食作息好好照顧自己。'
  },
  '澤風大過': {
    fortune: '凶',
    description: '房梁壓彎了——承受的壓力已經嚴重超標，再不處理就要斷裂。大過就是「太過了」。',
    advice: '趕緊減負！能放下的放下，能求助的求助。別再硬撐了，懂得喊停也是智慧。'
  },
  '坎為水': {
    fortune: '凶',
    description: '雙重險境，水上加水。前有深坑後有陷阱，目前處境確實不樂觀，需要極大的勇氣和信心。',
    advice: '保持信心是唯一的武器。像水一樣柔軟但堅持流動，不放棄就不會被困死。撐住就贏了。'
  },
  '離為火': {
    fortune: '中吉',
    description: '雙重光明，但火需要依附燃料才能持續。你很有才華和熱情，但需要找到支撐點。',
    advice: '借力使力，依靠對的人和資源。單獨燃燒會耗盡自己，找到能讓你持續發光的平台。'
  },
  '澤山咸': {
    fortune: '吉',
    description: '山上有澤，互相感應交流。這是感應之卦——人與人之間有美好的吸引力和共鳴。',
    advice: '桃花運或貴人運正旺。敞開心扉別裝高冷，好緣份就在眼前，主動一點就能遇到。'
  },
  '雷風恆': {
    fortune: '中吉',
    description: '雷動風隨，持久恆定。不是要你做什麼新動作，而是把現在的事情堅持做下去。',
    advice: '別三心二意，持之以恆就是最大的競爭力。耐得住寂寞才守得住繁華。'
  },
  '天山遯': {
    fortune: '平',
    description: '山在天下退隱。戰略撤退的時候到了——遯不是逃跑，是以退為進的大智慧。',
    advice: '該退就退，別死撐面子。留得青山在不怕沒柴燒，先保全自己再圖後計。'
  },
  '雷天大壯': {
    fortune: '吉',
    description: '雷在天上，聲勢浩大！力量很強、氣勢如虹，像公羊一樣精力充沛。',
    advice: '有實力但別莽撞。力氣大更要用對地方，控制好節奏，別拿大砲打蚊子。'
  },
  '火地晉': {
    fortune: '大吉',
    description: '太陽從地平線升起來了！光明上升、前途大好——事業升遷、進步、被看見的時候到了。',
    advice: '主動展現自己的能力，貴人正在關注你。該出手就出手，機會不等人！'
  },
  '地火明夷': {
    fortune: '凶',
    description: '太陽落入地下，光明被壓制。有才華卻發揮不出來，像被烏雲遮住的太陽。',
    advice: '現在不適合鋒芒畢露，藏拙保身。韜光養晦等天亮再說，保護好自己最重要。'
  },
  '風火家人': {
    fortune: '吉',
    description: '風從火出，溫暖傳遍四方。家庭和諧之卦，先把家裡的事搞定，外面的事才能順。',
    advice: '多關心家人，處理好親密關係。後院穩固了，前線才能打勝仗。'
  },
  '火澤睽': {
    fortune: '小凶',
    description: '火往上燒水往下流，方向相反。看法不同、立場對立，像兩個人背對背走路。',
    advice: '求同存異，別硬要對方跟你一樣。換個角度看問題，也許能在分歧中找到共識。'
  },
  '水山蹇': {
    fortune: '凶',
    description: '前面是深水後面是高山，進退兩難、寸步難行。目前的困難確實不小。',
    advice: '硬闖不如繞路，找人幫忙、換條路走。面對困難需要的是智慧而非蠻力。'
  },
  '雷水解': {
    fortune: '吉',
    description: '春雷響起冰雪消融，困難正在解除！之前困住你的壓力和阻礙開始鬆動了。',
    advice: '問題正在解決的路上，別再去製造新的麻煩。簡單化處理，速戰速決，輕裝上陣。'
  },
  '山澤損': {
    fortune: '平',
    description: '山下有澤，山高澤深。有損失，但損下益上——先付出才有回報，先苦後甜。',
    advice: '該花的花、該付出的付出。把眼光放遠一點，現在的損失就是將來收益的種子。'
  },
  '風雷益': {
    fortune: '大吉',
    description: '風雷交加，草木皆長。有好處來了！上面的資源和幫助正在往你這裡流。',
    advice: '遇到好機會大膽接住，別扭扭捏捏。有人幫你是你的福氣，接受並感恩。'
  },
  '澤天夬': {
    fortune: '中吉',
    description: '湖水漫上天際，快要溢出來了。該決斷的時候到了——快刀斬亂麻、清除障礙。',
    advice: '下定決心處理那個拖了很久的事。果斷但不莽撞，先把話說清楚再動手。'
  },
  '天風姤': {
    fortune: '小凶',
    description: '天底下突然起了一陣風——不期而遇。可能遇到誘惑或意想不到的人事物。',
    advice: '保持警覺，天上掉下來的餡餅先聞聞再吃。看起來太好的事情多想三秒鐘。'
  },
  '澤地萃': {
    fortune: '吉',
    description: '澤在地上，萬物聚集。人才、資源、機會都在向你匯聚，人氣旺盛。',
    advice: '趁大家都在的時候把事情推動。適合開會、合作、建立團隊、參加活動。'
  },
  '地風升': {
    fortune: '大吉',
    description: '風從地底往上吹，種子破土而出。一路穩穩往上升，成長的勢頭非常好。',
    advice: '一步一腳印往上走，不需要跳級也不用抄捷徑。穩紮穩打就是最快的路。'
  },
  '澤水困': {
    fortune: '凶',
    description: '澤裡的水漏光了——被困住了。口袋空空、能量耗盡、說話沒人聽的窘境。',
    advice: '最困難的時候往往離轉機最近。管住嘴少抱怨，把力氣用在行動上突圍。'
  },
  '水風井': {
    fortune: '中吉',
    description: '井水養育眾人，取之不盡。你的基本盤是穩的，根基還在，回到根本去找答案。',
    advice: '別捨近求遠，答案就在你身邊。維護好你的核心技能和關鍵人脈，那才是活水源頭。'
  },
  '澤火革': {
    fortune: '中吉',
    description: '澤中有火，水火交戰。舊的秩序要被推翻了——變革之卦，舊的不去新的不來。',
    advice: '如果一直重複同樣的事卻期待不同結果，那就是該改變的時候了。大膽革新吧。'
  },
  '火風鼎': {
    fortune: '大吉',
    description: '鼎是煮飯的重器——把舊食材熬成新美味。轉化、重生、新氣象，舊格局正在被打破。',
    advice: '接受改變，大膽嘗試新方向。就像熬湯一樣，新配方可能煮出意想不到的好味道。'
  },
  '震為雷': {
    fortune: '中吉',
    description: '雷聲連續轟鳴！突然的變動或衝擊讓人心驚，但震完之後反而雨過天晴。',
    advice: '遇到突發狀況別慌，穩住心神。驚嚇過後往往因禍得福，有驚無險就是好消息。'
  },
  '艮為山': {
    fortune: '平',
    description: '兩座山疊在一起——該停就停。山就是不動的意思，現在是該踩煞車的時候了。',
    advice: '別再瞎忙了，靜下心來想清楚再走下一步。有時候不動就是最好的行動。'
  },
  '風山漸': {
    fortune: '吉',
    description: '大雁南飛，一步一步穩穩地前進。循序漸進，不急不躁，方向是對的。',
    advice: '急不來的事就別急，按部就班反而走得最快。欲速則不達，穩住節奏就對了。'
  },
  '雷澤歸妹': {
    fortune: '小凶',
    description: '位置有點不太對——可能在一段關係或處境中處於被動地位，心有不甘。',
    advice: '認清現實，調整期望值。有些事強求不來，先管好自己的一畝三分地再說。'
  },
  '雷火豐': {
    fortune: '吉',
    description: '雷電交加、光芒萬丈。豐盛到了頂點！就像正午的太陽，光輝燦爛。',
    advice: '享受高光時刻但千萬別飄。盛極必衰是自然規律，趁好的時候為將來未雨綢繆。'
  },
  '火山旅': {
    fortune: '平',
    description: '山上起火，不斷移動。旅人的卦——漂泊在外、居無定所，處境不太安穩。',
    advice: '出門在外凡事小心，低調行事。先找到能穩定落腳的地方，安頓下來才是重點。'
  },
  '巽為風': {
    fortune: '中吉',
    description: '風無處不入，柔軟卻無孔不鑽。用耐心和溫柔去滲透，比硬碰硬有效得多。',
    advice: '說話做事溫和一點，軟釘子比硬拳頭管用。反覆溝通、堅持表達，終會被接受。'
  },
  '兌為澤': {
    fortune: '吉',
    description: '兩個湖泊相連，喜悅之卦！心情愉快、人緣大好、笑口常開的好氣象。',
    advice: '多笑、多社交、多表達善意。你的快樂會感染身邊的人，好運也跟著好心情來。'
  },
  '風水渙': {
    fortune: '中吉',
    description: '風吹水面，波紋四散。能量渙散了，人心不太聚攏，注意力也分散。',
    advice: '找到一個核心目標把精力集中起來。別什麼都想做，聚焦才有力量。收心是第一步。'
  },
  '水澤節': {
    fortune: '中吉',
    description: '水在澤上，需要堤壩來節制。節制之卦——花錢、說話、慾望都要有個度。',
    advice: '給自己設個合理的限度。過度和不及都不好，中庸之道、量力而行最穩當。'
  },
  '風澤中孚': {
    fortune: '吉',
    description: '風吹過湖面泛起漣漪——內心的真誠向外傳遞。誠信的力量大到能感動天地。',
    advice: '拿出你最真實的一面去面對問題和人。誠意是最強的通行證，真心換真心。'
  },
  '雷山小過': {
    fortune: '平',
    description: '小鳥飛過山頭——飛不高但也安全。小事可以做，大事先別碰，量力而行。',
    advice: '做力所能及的小事就好，別好高騖遠。小處著手、大處著眼，穩穩的就好。'
  },
  '水火既濟': {
    fortune: '中吉',
    description: '水在火上，萬事已成。該完成的都完成了，是功德圓滿的象——但完成才是考驗的開始。',
    advice: '已經到手的成果好好守住。最怕成功之後掉以輕心，善始還要善終。'
  },
  '火水未濟': {
    fortune: '平',
    description: '火在水上，還沒到位。最後一哩路還沒走完——像小狐狸過河差點打濕尾巴。',
    advice: '快到了但還沒到！最後關頭更要小心謹慎，穩住心神別在終點線前功虧一簣。'
  }
};

// ========== 運勢標籤顏色 ==========
function getFortuneColor(fortune) {
  switch (fortune) {
    case '大吉': return '#FFD700';
    case '吉': return '#4CAF50';
    case '中吉': return '#8BC34A';
    case '平': return '#9E9E9E';
    case '小凶': return '#FF9800';
    case '凶': return '#F44336';
    default: return '#FFFFFF';
  }
}

// ========== 第一步：驗證表單 ==========
function startDivine() {
  var zodiac = document.getElementById('zodiac').value;
  var age = document.getElementById('age').value;
  var question = document.getElementById('question').value.trim();

  if (!zodiac) { alert('請選擇你的生肖'); return; }
  if (!age || age < 1 || age > 120) { alert('請輸入正確的歲數'); return; }
  if (!question) { alert('請輸入你想問的問題'); return; }

  userZodiac = zodiac;
  userAge = age;
  userQuestion = question;

  document.getElementById('step1').style.display = 'none';
  document.getElementById('step2').style.display = 'block';
}

// ========== 第二步：擲銅錢 ==========
function throwCoins() {
  if (throws.length >= 6) return;

  var btn = document.getElementById('throwBtn');
  btn.disabled = true;

  var coinElements = document.querySelectorAll('.coin');
  coinElements.forEach(function (el) { el.className = 'coin flipping'; });

  setTimeout(function () {
    var sum = 0;
    for (var i = 0; i < 3; i++) {
      var isHeads = Math.random() > 0.5;
      sum += isHeads ? 3 : 2;
      coinElements[i].className = 'coin ' + (isHeads ? 'heads' : 'tails');
      coinElements[i].textContent = isHeads ? '字' : '花';
    }

    throws.push(sum);

    var resultText = '';
    if (sum === 6) resultText = '⚋ 老陰 —✕— 此爻有變';
    else if (sum === 7) resultText = '⚊ 少陽 ——— 陽爻';
    else if (sum === 8) resultText = '⚋ 少陰 — — 陰爻';
    else if (sum === 9) resultText = '⚊ 老陽 —○— 此爻有變';

    document.getElementById('throwResult').textContent = '第' + throws.length + '爻：' + resultText;
    document.getElementById('throwCount').textContent = throws.length;

    addHexagramLine(sum, throws.length);

    if (throws.length < 6) {
      btn.textContent = '擲第 ' + (throws.length + 1) + ' 爻';
      btn.disabled = false;
    } else {
      btn.textContent = '卦象已成，解卦中...';
      setTimeout(showResult, 1000);
    }
  }, 700);
}

// ========== 繪製爻線 ==========
function addHexagramLine(value, lineNum) {
  var container = document.getElementById('hexagramLines');
  var row = document.createElement('div');
  row.className = 'line-row';

  var label = document.createElement('span');
  label.className = 'line-label';
  label.textContent = lineNum + '爻';
  row.appendChild(label);

  if (value === 7 || value === 9) {
    var seg = document.createElement('div');
    seg.className = 'line-segment';
    row.className += ' line-yang';
    row.appendChild(seg);
  } else {
    var seg1 = document.createElement('div');
    seg1.className = 'line-segment';
    var gap = document.createElement('div');
    gap.className = 'line-gap';
    var seg2 = document.createElement('div');
    seg2.className = 'line-segment';
    row.className += ' line-yin';
    row.appendChild(seg1);
    row.appendChild(gap);
    row.appendChild(seg2);
  }

  if (value === 6 || value === 9) {
    var mark = document.createElement('span');
    mark.style.color = '#d4af37';
    mark.style.fontSize = '12px';
    mark.style.marginLeft = '8px';
    mark.textContent = value === 9 ? '○' : '✕';
    row.appendChild(mark);
  }

  container.appendChild(row);
}

// ========== 第三步：顯示結果（免費版＝本地資料庫） ==========
function showResult() {
  var lines = throws.map(function (v) { return (v === 7 || v === 9) ? 1 : 0; });

  var lowerVal = lines[0] * 1 + lines[1] * 2 + lines[2] * 4;
  var upperVal = lines[3] * 1 + lines[4] * 2 + lines[5] * 4;

  var lowerName = trigramNames[lowerVal];
  var upperName = trigramNames[upperVal];
  var hexName = hexagramMap[upperName + lowerName] || '未知卦象';

  var changingLines = [];
  for (var i = 0; i < throws.length; i++) {
    if (throws[i] === 6 || throws[i] === 9) changingLines.push(i + 1);
  }

  // 切換結果頁
  document.getElementById('step2').style.display = 'none';
  document.getElementById('step3').style.display = 'block';
  document.getElementById('hexagramName').textContent = '【' + hexName + '】';

  // 繪製完整卦象
  var display = document.getElementById('hexagramDisplay');
  display.innerHTML = '';
  for (var i = 0; i < 6; i++) {
    var row = document.createElement('div');
    row.className = 'line-row';

    var label = document.createElement('span');
    label.className = 'line-label';
    label.textContent = (i + 1) + '爻';
    row.appendChild(label);

    if (lines[i] === 1) {
      var seg = document.createElement('div');
      seg.className = 'line-segment';
      row.className += ' line-yang';
      row.appendChild(seg);
    } else {
      var seg1 = document.createElement('div');
      seg1.className = 'line-segment';
      var gap = document.createElement('div');
      gap.className = 'line-gap';
      var seg2 = document.createElement('div');
      seg2.className = 'line-segment';
      row.className += ' line-yin';
      row.appendChild(seg1);
      row.appendChild(gap);
      row.appendChild(seg2);
    }

    if (throws[i] === 6 || throws[i] === 9) {
      var mark = document.createElement('span');
      mark.style.color = '#d4af37';
      mark.style.fontSize = '12px';
      mark.style.marginLeft = '8px';
      mark.textContent = throws[i] === 9 ? '○' : '✕';
      row.appendChild(mark);
    }

    display.appendChild(row);
  }

  // ===== 免費版解讀（本地資料） =====
  var interp = hexagramInterpretations[hexName];
  var resultDiv = document.getElementById('aiResult');

  if (interp) {
    var fortuneColor = getFortuneColor(interp.fortune);

    resultDiv.innerHTML =
      '<div style="margin-bottom:20px;text-align:center;">' +
        '<span style="display:inline-block;padding:4px 18px;border-radius:20px;' +
        'background:' + fortuneColor + ';color:#1a1a2e;font-weight:bold;font-size:14px;">' +
        interp.fortune + '</span>' +
      '</div>' +
      '<p style="font-size:15px;line-height:1.9;color:#d0d0d0;margin-bottom:14px;">' +
        interp.description +
      '</p>' +
      '<p style="font-size:15px;line-height:1.9;color:#d4af37;">' +
        '💡 ' + interp.advice +
      '</p>' +

      // ===== 荊叔親批 NT$29 CTA =====
      '<div style="margin-top:28px;padding-top:22px;border-top:1px solid rgba(212,175,55,0.15);text-align:center;">' +
        '<p style="color:#888;font-size:13px;margin-bottom:10px;">' +
          '以上是基本卦象解讀' +
        '</p>' +
        '<p style="color:#bbb;font-size:14px;margin-bottom:18px;line-height:1.7;">' +
          '想知道變爻如何影響走向？<br>想結合生肖歲數深度分析？' +
        '</p>' +
        '<button onclick="requestPremium()" id="premiumBtn" ' +
        'style="background:linear-gradient(135deg,#b8960c,#d4af37,#f4d03f,#d4af37);' +
        'color:#1a1a2e;border:none;padding:15px 28px;border-radius:10px;font-size:16px;' +
        'font-weight:bold;cursor:pointer;letter-spacing:2px;width:100%;' +
        'transition:all 0.3s ease;">' +
          '☯ 荊叔親批 NT$29 — 為你掐指精算' +
        '</button>' +
      '</div>' +

      // 親批結果區（初始隱藏）
      '<div id="premiumResult" style="display:none;margin-top:22px;padding:20px;' +
      'background:rgba(212,175,55,0.03);border:1px solid rgba(212,175,55,0.12);' +
      'border-radius:12px;"></div>';

  } else {
    resultDiv.innerHTML = '<p style="color:#999;text-align:center;">此卦象暫無解讀資料。</p>';
  }

  // ===== 預存親批訊息（按下才送出） =====
  var changingText = changingLines.length > 0
    ? '變爻在第 ' + changingLines.join('、') + ' 爻'
    : '無變爻';

  var lineDesc = throws.map(function (v, idx) {
    var type = '';
    if (v === 6) type = '老陰（變爻）';
    else if (v === 7) type = '少陽';
    else if (v === 8) type = '少陰';
    else if (v === 9) type = '老陽（變爻）';
    return '第' + (idx + 1) + '爻：' + type;
  }).join('\n');

  pendingMessage = '【求卦者資料】\n'
    + '生肖：' + userZodiac + '\n'
    + '歲數：' + userAge + '歲\n\n'
    + '【問題】\n' + userQuestion + '\n\n'
    + '【卦象】' + hexName + '\n'
    + '上卦：' + upperName + '　下卦：' + lowerName + '\n'
    + changingText + '\n\n'
    + '【各爻】\n' + lineDesc + '\n\n'
    + '請根據以上卦象，結合求卦者的生肖與歲數，為其深度解卦。';
}

// ========== 荊叔親批 NT$29（暫時擋住，等金流串好再開放） ==========
function requestPremium() {
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;z-index:9999;';

  var box = document.createElement('div');
  box.style.cssText = 'background:#1a1a2e;border:1px solid rgba(212,175,55,0.3);border-radius:16px;padding:30px 24px;max-width:320px;text-align:center;margin:0 16px;';
  box.innerHTML =
    '<p style="font-size:32px;margin-bottom:12px;">🔮</p>' +
    '<p style="color:#d4af37;font-size:18px;font-weight:bold;margin-bottom:12px;">荊叔親批 NT$29即將開放</p>' +
    '<p style="color:#bbb;font-size:14px;line-height:1.8;margin-bottom:20px;">' +
      '付款功能正在準備中，<br>預計近日正式上線，敬請期待～<br><br>' +
      '<span style="color:#d4af37;">届時荊叔將為你親自批算，<br>給出最深入的專屬解析！</span>' +
    '</p>' +
    '<button onclick="this.parentElement.parentElement.remove()" ' +
    'style="background:linear-gradient(135deg,#b8960c,#d4af37);color:#1a1a2e;border:none;' +
    'padding:10px 30px;border-radius:8px;font-size:15px;font-weight:bold;cursor:pointer;">' +
    '好的，我等著</button>';

  overlay.appendChild(box);
  overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
  document.body.appendChild(overlay);
}

// ========== 重置 ==========
function resetAll() {
  throws = [];
  userZodiac = '';
  userAge = '';
  userQuestion = '';
  pendingMessage = '';

  document.getElementById('zodiac').value = '';
  document.getElementById('age').value = '';
  document.getElementById('question').value = '';
  document.getElementById('hexagramLines').innerHTML = '';
  document.getElementById('throwCount').textContent = '0';
  document.getElementById('throwResult').textContent = '';
  document.getElementById('throwBtn').textContent = '擲第 1 爻';
  document.getElementById('throwBtn').disabled = false;
  document.getElementById('aiResult').innerHTML = '';

  var coinElements = document.querySelectorAll('.coin');
  coinElements.forEach(function (el) {
    el.className = 'coin';
    el.textContent = '㊀';
  });

  document.getElementById('step3').style.display = 'none';
  document.getElementById('step2').style.display = 'none';
  document.getElementById('step1').style.display = 'block';
}