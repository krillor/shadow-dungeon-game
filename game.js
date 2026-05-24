// ==================== 娓告垙鏁版嵁瀹氫箟 ====================

const QUALITIES = ['common','rare','epic','legendary','mythic'];
const QUALITY_NAMES = {common:'鏅€?,rare:'绋€鏈?,epic:'鍙茶瘲',legendary:'浼犺',mythic:'绁炶瘽'};
const QUALITY_MULT = {common:1.0, rare:1.25, epic:1.55, legendary:1.9, mythic:2.4};
const QUALITY_COLORS = {common:'#888',rare:'#4a9eff',epic:'#a855f7',legendary:'#f59e0b',mythic:'#ef4444'};

// 绛夌骇鎴愰暱锛氬鏁拌“鍑忔洸绾匡紝鍓嶆湡蹇悗鏈熸參锛岄伩鍏嶆棤闄愯啫鑳€
// 鍏紡: stat = baseStat * qualityMult * (1 + GROWTH_RATE * ln(1 + level))
const GROWTH_RATE = 0.35;
function calcStat(base, qualityMult, level){
  return Math.floor(base * qualityMult * (1 + GROWTH_RATE * Math.log(1 + level)));
}

const ROLES = {
  //           HP   ATK  DEF  SPD  MP
  // 鍧﹀厠绾? guardian(180) >> paladin(130) > warrior(120)
  // 杈撳嚭绾? mage(26) > assassin(24) > warlock(22) > warrior(18) > ranger(16) > paladin(14) > guardian(10) > healer(8)
  // 閫熷害绾? assassin(18) > ranger(16) > healer(14) > mage(11) > warlock(10) > warrior(9) > paladin(7) > guardian(6)
  // 钃濋噺绾? mage(90) > warlock(80) > healer(75) > paladin(60) > ranger(50) > guardian(45) > assassin(35) > warrior(30)
  warrior: {name:'鎴樺＋',icon:'鈿旓笍',desc:'杩戞垬鐗╃悊杈撳嚭锛岄珮鐢熷懡楂樻敾鍑?,baseHP:120,baseATK:18,baseDEF:13,baseSPD:9,baseMP:30,
    passive:{name:'鐙傛€?,desc:'鐢熷懡鍊间綆浜?0%鏃舵敾鍑诲姏鎻愬崌50%'},critRate:0.15,critDmg:1.5},
  guardian: {name:'瀹堟姢鑰?,icon:'馃洝锔?,desc:'鍓嶆帓鍧﹀厠锛屾瀬楂樼敓鍛藉拰闃插尽',baseHP:180,baseATK:10,baseDEF:20,baseSPD:6,baseMP:45,
    passive:{name:'閾佸',desc:'鍙楀埌鐨勪激瀹冲噺灏?0%'},damageReduction:0.2,shieldBoost:0.3},
  mage:    {name:'娉曞笀',icon:'馃敭',desc:'杩滅▼榄旀硶浼ゅ锛岄珮鐖嗗彂楂樿摑閲?,baseHP:65,baseATK:26,baseDEF:4,baseSPD:11,baseMP:90,
    passive:{name:'濂ユ湳绮鹃€?,desc:'鎶€鑳戒激瀹虫彁鍗?0%锛屾毚鍑荤巼+20%'},skillDmgBoost:0.3,critRate:0.2},
  healer:  {name:'娌绘剤鑰?,icon:'馃挌',desc:'鎭㈠闃熷弸鐢熷懡鍊硷紝楂橀€熷害楂樿摑閲?,baseHP:85,baseATK:8,baseDEF:9,baseSPD:14,baseMP:75,
    passive:{name:'鐢熷懡閾炬帴',desc:'娌荤枟鏁堟灉鎻愬崌40%锛屾瘡鍥炲悎鑷姩鎭㈠5%鐢熷懡鍊?},healBoost:0.4,regenPct:0.05},
  assassin:{name:'鍒哄',icon:'馃棥锔?,desc:'鏋侀珮閫熷害鍜屾毚鍑伙紝鍗曚綋鐖嗗彂',baseHP:70,baseATK:24,baseDEF:5,baseSPD:18,baseMP:35,
    passive:{name:'鏆楀奖姝?,desc:'闂伩鐜?25%锛屾毚鍑讳激瀹?50%'},dodgeRate:0.25,critRate:0.25,critDmg:2.0},
  ranger:  {name:'娓镐緺',icon:'馃徆',desc:'杩滅▼鐗╃悊杈撳嚭锛岄珮閫熷害绋冲畾杈撳嚭',baseHP:90,baseATK:16,baseDEF:7,baseSPD:16,baseMP:50,
    passive:{name:'绮惧噯',desc:'鍛戒腑鐜?30%锛屾敾鍑绘棤瑙嗙洰鏍?0%闃插尽'},hitBonus:0.3,armorPen:0.2},
  warlock: {name:'鏈＋',icon:'馃憗锔?,desc:'鎸佺画浼ゅ鍜屽墛寮辨晫浜猴紝楂樻敾鍑婚珮钃濋噺',baseHP:70,baseATK:22,baseDEF:5,baseSPD:10,baseMP:80,
    passive:{name:'鐏甸瓊铏瑰惛',desc:'閫犳垚浼ゅ鐨?5%杞寲涓虹敓鍛芥仮澶嶏紝DOT浼ゅ+50%'},lifeSteal:0.15,dotBoost:0.5},
  paladin: {name:'鍦ｉ獞澹?,icon:'鉁?,desc:'鏀诲畧鍏煎锛岃兘娌荤枟鑳借緭鍑?,baseHP:130,baseATK:14,baseDEF:15,baseSPD:7,baseMP:60,
    passive:{name:'鍦ｅ厜搴囨姢',desc:'鍙楀埌鑷村懡浼ゅ鏃朵繚鐣?鐐圭敓鍛斤紙姣忓満鎴樻枟1娆★級锛屽浜＄伒浼ゅ+50%'},undeadBonus:0.5,deathDefy:true}
};

const SKILLS = {
  // 鎴樺＋鎶€鑳?  cleave:      {name:'鏃嬮鏂?,icon:'馃寑',desc:'瀵规晫鏂瑰叏浣撻€犳垚60%鏀诲嚮鍔涚殑浼ゅ',type:'damage',target:'all_enemies',mult:0.6,mpCost:15,cooldown:2},
  shield_bash: {name:'鐩惧嚮',icon:'馃挜',desc:'瀵瑰崟浣撻€犳垚120%浼ゅ锛?0%姒傜巼鐪╂檿1鍥炲悎',type:'damage',target:'single_enemy',mult:1.2,mpCost:10,cooldown:1,stunChance:0.3},
  berserker:   {name:'鐙傛毚',icon:'馃敟',desc:'鑷韩鏀诲嚮鍔涙彁鍗?0%锛屾寔缁?鍥炲悎',type:'buff',target:'self',buff:{stat:'atk',mult:1.4,duration:3},mpCost:20,cooldown:4},
  // 瀹堟姢鑰呮妧鑳?  taunt:       {name:'鍢茶',icon:'馃槫',desc:'鍢茶鎵€鏈夋晫浜烘敾鍑昏嚜宸?鍥炲悎',type:'buff',target:'self',buff:{stat:'taunt',duration:2},mpCost:12,cooldown:3},
  iron_wall:   {name:'閾佸',icon:'馃П',desc:'鍏ㄤ綋闃熷弸闃插尽鎻愬崌50%锛屾寔缁?鍥炲悎',type:'buff',target:'all_allies',buff:{stat:'def',mult:1.5,duration:2},mpCost:20,cooldown:4},
  shield_bash_g:{name:'鐩剧墝鐚涘嚮',icon:'馃敤',desc:'閫犳垚100%浼ゅ骞堕檷浣庣洰鏍囨敾鍑?0%',type:'damage',target:'single_enemy',mult:1.0,mpCost:10,cooldown:2,debuff:{stat:'atk',mult:0.8,duration:2}},
  // 娉曞笀鎶€鑳?  fireball:    {name:'鐏悆鏈?,icon:'馃敟',desc:'瀵瑰崟浣撻€犳垚180%榄旀硶浼ゅ',type:'damage',target:'single_enemy',mult:1.8,mpCost:20,cooldown:1},
  blizzard:    {name:'鏆撮闆?,icon:'鉂勶笍',desc:'瀵瑰叏浣撻€犳垚70%浼ゅ锛?0%姒傜巼鍐板喕',type:'damage',target:'all_enemies',mult:0.7,mpCost:30,cooldown:3,stunChance:0.3},
  arcane_shield:{name:'濂ユ湳鎶ょ浘',icon:'馃挔',desc:'涓哄叏浣撻槦鍙嬫坊鍔犳姢鐩撅紝鍚告敹鏈€澶х敓鍛?5%鐨勪激瀹?,type:'shield',target:'all_allies',shieldPct:0.15,mpCost:25,cooldown:4},
  // 娌绘剤鑰呮妧鑳?  heal:        {name:'娌荤枟鏈?,icon:'馃挌',desc:'鎭㈠鍗曚綋40%鏈€澶х敓鍛藉€?,type:'heal',target:'single_ally',healPct:0.4,mpCost:15,cooldown:1},
  group_heal:  {name:'缇や綋娌荤枟',icon:'馃寛',desc:'鎭㈠鍏ㄤ綋25%鏈€澶х敓鍛藉€?,type:'heal',target:'all_allies',healPct:0.25,mpCost:30,cooldown:3},
  purify:      {name:'鍑€鍖?,icon:'鉁?,desc:'绉婚櫎鍏ㄤ綋闃熷弸鐨勮礋闈㈡晥鏋?,type:'cleanse',target:'all_allies',mpCost:20,cooldown:3},
  // 鍒哄鎶€鑳?  backstab:    {name:'鑳屽埡',icon:'馃敧',desc:'瀵瑰崟浣撻€犳垚200%浼ゅ锛屾毚鍑荤巼+30%',type:'damage',target:'single_enemy',mult:2.0,mpCost:18,cooldown:1,critBonus:0.3},
  shadow_step: {name:'鏆楀奖姝?,icon:'馃懁',desc:'闂伩鐜囨彁鍗?0%锛屾寔缁?鍥炲悎',type:'buff',target:'self',buff:{stat:'dodge',mult:1.5,duration:2},mpCost:15,cooldown:3},
  poison_blade:{name:'姣掑垉',icon:'鈽狅笍',desc:'閫犳垚120%浼ゅ骞堕檮鍔犱腑姣?姣忓洖鍚?0%鏀诲嚮鍔涳紝3鍥炲悎)',type:'damage',target:'single_enemy',mult:1.2,mpCost:12,cooldown:2,dot:{name:'涓瘨',dmgPct:0.1,duration:3}},
  // 娓镐緺鎶€鑳?  aimed_shot:  {name:'绮惧噯灏勫嚮',icon:'馃幆',desc:'瀵瑰崟浣撻€犳垚160%浼ゅ锛屽繀涓?,type:'damage',target:'single_enemy',mult:1.6,mpCost:15,cooldown:1,alwaysHit:true},
  rain_arrows: {name:'绠洦',icon:'馃導锔?,desc:'瀵瑰叏浣撻€犳垚55%浼ゅ',type:'damage',target:'all_enemies',mult:0.55,mpCost:22,cooldown:2},
  trap:        {name:'闄烽槺',icon:'馃',desc:'璁剧疆闄烽槺锛屼笅娆″彈鍒版敾鍑绘椂鍙嶅脊50%浼ゅ',type:'buff',target:'self',buff:{stat:'reflect',mult:0.5,duration:2},mpCost:12,cooldown:3},
  // 鏈＋鎶€鑳?  curse:       {name:'璇呭拻',icon:'馃寫',desc:'闄嶄綆鐩爣鏀诲嚮鍜岄槻寰?5%锛屾寔缁?鍥炲悎',type:'debuff',target:'single_enemy',debuff:{stat:'all',mult:0.75,duration:3},mpCost:18,cooldown:2},
  life_drain:  {name:'鐢熷懡姹插彇',icon:'馃└',desc:'閫犳垚130%浼ゅ骞舵仮澶嶇瓑閲忕敓鍛?,type:'drain',target:'single_enemy',mult:1.3,mpCost:20,cooldown:2},
  soul_burn:   {name:'鐏甸瓊鐏肩儳',icon:'馃拃',desc:'瀵瑰崟浣撻€犳垚150%浼ゅ锛岄檮鍔犵伡鐑?姣忓洖鍚?%鏀诲嚮鍔涳紝3鍥炲悎)',type:'damage',target:'single_enemy',mult:1.5,mpCost:25,cooldown:3,dot:{name:'鐏肩儳',dmgPct:0.08,duration:3}},
  // 鍦ｉ獞澹妧鑳?  holy_strike: {name:'鍦ｅ厜鎵撳嚮',icon:'鈿?,desc:'瀵瑰崟浣撻€犳垚140%浼ゅ锛屽浜＄伒绫婚澶?0%',type:'damage',target:'single_enemy',mult:1.4,mpCost:15,cooldown:1},
  holy_light:  {name:'鍦ｅ厜鏈?,icon:'馃専',desc:'鎭㈠鍏ㄤ綋20%鐢熷懡鍊?,type:'heal',target:'all_allies',healPct:0.2,mpCost:25,cooldown:3},
  divine_shield:{name:'鍦ｇ浘鏈?,icon:'馃敯',desc:'涓哄崟浣撴坊鍔犳姢鐩撅紝鍚告敹30%鏈€澶х敓鍛藉€间激瀹?,type:'shield',target:'single_ally',shieldPct:0.3,mpCost:20,cooldown:3}
};

// 鑻遍泟妯℃澘
const HERO_TEMPLATES = [
  // ========== 鏅€?(10涓? ==========
  {id:'swordsman',name:'鍓戝＋',icon:'馃棥锔?,role:'warrior',quality:'common',skills:['cleave'],lore:'鍓嶅笣鍥界殑鏅€氬＋鍏碉紝鍦ㄥ簾澧熶腑娴佹氮姹傜敓銆?},
  {id:'militia',name:'姘戝叺',icon:'馃獡',role:'warrior',quality:'common',skills:['shield_bash'],lore:'鏉戝簞鐨勮嚜鍗槦鎴愬憳锛岃櫧鏃犵簿鑹澶囧嵈鍕囨皵鍙槈銆?},
  {id:'squire',name:'渚嶄粠',icon:'馃洝锔?,role:'guardian',quality:'common',skills:['taunt'],lore:'璺熼殢楠戝＋澶氬勾鐨勫繝瀹炰緧浠庯紝瀛︿細浜嗗熀鏈殑闃插尽鎶€宸с€?},
  {id:'apprentice',name:'瀛﹀緬娉曞笀',icon:'馃摉',role:'mage',quality:'common',skills:['fireball'],lore:'榄旀硶瀛﹂櫌閫€瀛︾殑瀛﹀緬锛屾帉鎻′簡涓€浜涘熀纭€娉曟湳銆?},
  {id:'herbalist',name:'鑽夎嵂甯?,icon:'馃尶',role:'healer',quality:'common',skills:['heal'],lore:'娣卞北涓殑鑽夎嵂甯堬紝鎿呴暱鐢ㄨ嚜鐒朵箣鍔涙不鎰堜激鐥涖€?},
  {id:'thief',name:'灏忓伔',icon:'馃か',role:'assassin',quality:'common',skills:['backstab'],lore:'琛楀ご鐨勬墥鎵嬶紝韬墜鏁忔嵎浣嗙己涔忔瑙勮缁冦€?},
  {id:'hunter',name:'鐚庝汉',icon:'馃徆',role:'ranger',quality:'common',skills:['aimed_shot'],lore:'妫灄涓殑鐚庝汉锛岀鏈簿鍑嗕絾缁忛獙灏氭祬銆?},
  {id:'acolyte',name:'渚嶅儳',icon:'馃暞锔?,role:'warlock',quality:'common',skills:['curse'],lore:'鏆楀奖鏁欐淳鐨勪綆绾т緧鍍э紝鎺屾彙寰急鐨勮瘏鍜掍箣鍔涖€?},
  {id:'novice_paladin',name:'瑙佷範楠戝＋',icon:'鈿?,role:'paladin',quality:'common',skills:['holy_strike'],lore:'鍒氬垰韪忎笂鍦ｅ厜涔嬭矾鐨勮涔犻獞澹€?},
  {id:'peasant_guard',name:'姘戝叺瀹堝崼',icon:'馃鈥嶐煂?,role:'guardian',quality:'common',skills:['shield_bash'],lore:'鎷胯捣閿勫ご淇濆崼瀹跺洯鐨勬櫘閫氬啘姘戙€?},

  // ========== 绋€鏈?(12涓? ==========
  {id:'knight',name:'楠戝＋',icon:'馃惔',role:'warrior',quality:'rare',skills:['cleave','berserker'],lore:'瑾撴鏁堝繝鐨勫笣鍥介獞澹紝鍦ㄧ帇鍥借鐏悗缁х画鎴樻枟銆?},
  {id:'iron_guard',name:'閾佸崼',icon:'馃彴',role:'guardian',quality:'rare',skills:['taunt','iron_wall'],lore:'鍩庡瀹堝崼闃熺殑闃熼暱锛岃韩缁忕櫨鎴橈紝鍧氫笉鍙懅銆?},
  {id:'pyromancer',name:'鐏劙娉曞笀',icon:'馃敟',role:'mage',quality:'rare',skills:['fireball','blizzard'],lore:'娌夎糠浜庣伀鐒伴瓟娉曠殑娉曞笀锛岃兘鍙敜鐑堢劙鐒氱儳鏁屼汉銆?},
  {id:'priest',name:'鐗у笀',icon:'鉀?,role:'healer',quality:'rare',skills:['heal','group_heal'],lore:'鍏夋槑鏁欏环鐨勭墽甯堬紝浠ヤ俊浠颁箣鍔涙不鎰堜紬鐢熴€?},
  {id:'shadow',name:'鏆楀奖鍒哄',icon:'馃寫',role:'assassin',quality:'rare',skills:['backstab','shadow_step'],lore:'鏆楀奖鍏細鐨勭簿鑻卞埡瀹紝鏉ユ棤褰卞幓鏃犺釜銆?},
  {id:'ranger_elite',name:'绮捐嫳娓镐緺',icon:'馃徆',role:'ranger',quality:'rare',skills:['aimed_shot','rain_arrows'],lore:'绮剧伒鏃忕殑娓镐緺锛岀櫨姝ョ┛鏉紝绠棤铏氬彂銆?},
  {id:'warlock_novice',name:'鏈＋瀛﹀緬',icon:'馃憗锔?,role:'warlock',quality:'rare',skills:['curse','life_drain'],lore:'琚瓟娉曞闄㈤┍閫愮殑瀛﹀緬锛岃浆鑰岀爺绌剁蹇岀殑鏆楀奖榄旀硶銆?},
  {id:'desert_ranger',name:'娌欐紶娓镐緺',icon:'馃彍锔?,role:'ranger',quality:'rare',skills:['aimed_shot','trap'],lore:'鏉ヨ嚜娌欐紶鐨勫鐙父渚狅紝鎿呴暱璁剧疆鑷村懡闄烽槺銆?},
  {id:'frost_mage',name:'鍐伴湝娉曞笀',icon:'馃',role:'mage',quality:'rare',skills:['blizzard','arcane_shield'],lore:'鍖楁柟鍐板師鐨勬硶甯堬紝浠ュ瘨鍐颁箣鍔涘喕缁撲竴鍒囥€?},
  {id:'battle_medic',name:'鎴樺湴鍖诲笀',icon:'馃┖',role:'healer',quality:'rare',skills:['heal','purify'],lore:'鍦ㄦ垬鍦轰笂鏁戞鎵朵激鐨勫尰甯堬紝瑙佹儻浜嗙敓姝汇€?},
  {id:'night_blade',name:'澶滃垉',icon:'馃寵',role:'assassin',quality:'rare',skills:['shadow_step','poison_blade'],lore:'鏈堝鍑烘病鐨勭绉樺埡瀹紝浠ユ瘨鍒冩敹鍓茬敓鍛姐€?},
  {id:'oath_knight',name:'瑾撹█楠戝＋',icon:'馃摐',role:'paladin',quality:'rare',skills:['holy_strike','divine_shield'],lore:'绔嬩笅绁炲湥瑾撹█鐨勯獞澹紝瀹堟姢寮辫€呮槸鍏朵娇鍛姐€?},

  // ========== 鍙茶瘲 (10涓? ==========
  {id:'berserker',name:'鐙傛垬澹?,icon:'馃槫',role:'warrior',quality:'epic',skills:['berserker','cleave','shield_bash'],lore:'鍖楁柟铔棌鐨勭媯鎴樺＋锛屾垬鏂椾腑瓒婃垬瓒婂媷锛屽け鍘荤悊鏅哄悗鏃犱汉鑳芥尅銆?},
  {id:'stone_golem',name:'鐭冲法浜?,icon:'馃椏',role:'guardian',quality:'epic',skills:['iron_wall','taunt','shield_bash_g'],lore:'杩滃彜榄旀硶鍒涢€犵殑鐭冲法浜猴紝娌夐粯鑰屽繝璇氾紝瀹堟姢鐫€鍙よ€佺殑绉樺瘑銆?},
  {id:'archmage',name:'澶ф硶甯?,icon:'馃専',role:'mage',quality:'epic',skills:['blizzard','fireball','arcane_shield'],lore:'鐜嬪浗鏈€鍚庣殑瀹堟姢鑰咃紝鎺屾彙鐫€澶变紶宸蹭箙鐨勫ゥ鏈姏閲忋€?},
  {id:'bishop',name:'涓绘暀',icon:'鉁濓笍',role:'healer',quality:'epic',skills:['group_heal','purify','heal'],lore:'鍏夋槑鏁欏环鐨勯珮闃朵富鏁欙紝鎷ユ湁椹辨暎涓€鍒囬粦鏆楃殑绁炲湥涔嬪姏銆?},
  {id:'phantom',name:'骞诲奖鍒哄',icon:'馃懟',role:'assassin',quality:'epic',skills:['shadow_step','poison_blade','backstab'],lore:'浼犺涓殑骞诲奖鍒哄锛屾嵁璇翠粠鏈湁浜鸿杩囦粬鐨勭湡闈㈢洰銆?},
  {id:'paladin',name:'鍦ｉ獞澹?,icon:'鉁?,role:'paladin',quality:'epic',skills:['holy_strike','holy_light','divine_shield'],lore:'鍦ｆ楠戝＋鍥㈢殑鍥㈤暱锛屼互鍏夋槑涔嬪悕琛岃蛋鍦ㄩ粦鏆楃殑鍦扮墷涓€?},
  {id:'storm_ranger',name:'椋庢毚娓镐緺',icon:'鉀堬笍',role:'ranger',quality:'epic',skills:['rain_arrows','trap','aimed_shot'],lore:'鑳藉彫鍞ら鏆寸殑娓镐緺锛岀鐭㈠闆烽渾鑸€炬郴銆?},
  {id:'blood_warlock',name:'琛€鏈＋',icon:'馃└',role:'warlock',quality:'epic',skills:['life_drain','curse','soul_burn'],lore:'浠ラ矞琛€涓哄獟浠嬫柦灞曠蹇屼箣鏈殑鏈＋銆?},
  {id:'nature_healer',name:'鑷劧绁徃',icon:'馃尶',role:'healer',quality:'epic',skills:['group_heal','purify','heal'],lore:'涓庤嚜鐒舵矡閫氱殑绁徃锛屽ぇ鍦扮殑鍔涢噺閫氳繃濂规不鎰堜竴鍒囥€?},
  {id:'war_monk',name:'姝﹀儳',icon:'馃憡',role:'warrior',quality:'epic',skills:['berserker','shield_bash','cleave'],lore:'浠ユ嫵涓烘鐨勮嫤琛屽儳锛岃倝韬嵆鏄渶濂界殑姝﹀櫒銆?},

  // ========== 浼犺 (8涓? ==========
  {id:'dragon_knight',name:'榫欓獞澹?,icon:'馃悏',role:'warrior',quality:'legendary',skills:['berserker','cleave','shield_bash'],lore:'涓庤繙鍙ゅ法榫欑璁㈠绾︾殑楠戝＋锛屾嫢鏈夐緳涔嬪姏閲忋€?},
  {id:'immortal',name:'涓嶆溄瀹堝崼',icon:'馃敱',role:'guardian',quality:'legendary',skills:['iron_wall','taunt','divine_shield'],lore:'琚瘏鍜掓案鐢熶笉姝荤殑瀹堝崼锛屽畧鎶ょ潃娣辨笂涔嬮棬宸插崈骞淬€?},
  {id:'lich_king',name:'宸鐜?,icon:'馃拃',role:'mage',quality:'legendary',skills:['blizzard','soul_burn','arcane_shield'],lore:'鏇剧粡浼熷ぇ鐨勫浗鐜嬶紝姝诲悗鍖栦负宸锛岀粺娌荤潃浜＄伒鍐涘洟銆?},
  {id:'archangel',name:'澶уぉ浣?,icon:'馃懠',role:'healer',quality:'legendary',skills:['group_heal','purify','holy_light'],lore:'鏉ヨ嚜澶╃晫鐨勪娇鑰咃紝鎷ユ湁璧锋鍥炵敓鐨勭鍦ｅ姏閲忋€?},
  {id:'death_reaper',name:'姝荤',icon:'鈿帮笍',role:'assassin',quality:'legendary',skills:['backstab','poison_blade','shadow_step'],lore:'姝讳骸鐨勫寲韬紝鏀跺壊鐏甸瓊鐨勪娇鑰咃紝鏃犱汉鑳戒粠浠栫殑闀板垁涓嬮€冭劚銆?},
  {id:'celestial_ranger',name:'澶╃晫娓镐緺',icon:'馃専',role:'ranger',quality:'legendary',skills:['rain_arrows','aimed_shot','trap'],lore:'鏉ヨ嚜澶╃晫鐨勬父渚狅紝绠煝甯︾潃鏄熻景涔嬪姏銆?},
  {id:'void_warlock',name:'铏氱┖鏈＋',icon:'馃寑',role:'warlock',quality:'legendary',skills:['curse','life_drain','soul_burn'],lore:'绐ユ帰铏氱┖娣辨笂鐨勬湳澹紝鎺屾彙浜嗘壄鏇茬幇瀹炵殑鍔涢噺銆?},
  {id:'divine_paladin',name:'绁炲湥楠戝＋',icon:'馃洝锔?,role:'paladin',quality:'legendary',skills:['holy_strike','holy_light','divine_shield'],lore:'琚湥鍏夊交搴曟礂绀肩殑楠戝＋锛屾槸榛戞殫鍔垮姏鐨勫厠鏄熴€?},

  // ========== 绁炶瘽 (4涓? ==========
  {id:'chaos_lord',name:'娣锋矊涔嬩富',icon:'馃槇',role:'warlock',quality:'mythic',skills:['curse','life_drain','soul_burn'],lore:'鏉ヨ嚜铏氱┖鐨勮繙鍙ゅ瓨鍦紝娣锋矊鍔涢噺鐨勫寲韬紝涓€鍒囩З搴忕殑缁堢粨鑰呫€?},
  {id:'world_tree',name:'涓栫晫涔嬫爲',icon:'馃尦',role:'healer',quality:'mythic',skills:['group_heal','purify','divine_shield'],lore:'杩炴帴澶╁湴鐨勪笘鐣屼箣鏍戝寲韬紝鎷ユ湁鏃犵┓鏃犲敖鐨勭敓鍛戒箣鍔涖€?},
  {id:'dragon_emperor',name:'榫欑殗',icon:'馃惒',role:'warrior',quality:'mythic',skills:['berserker','cleave','shield_bash'],lore:'涓囬緳涔嬬殗锛屼紶璇翠腑鏈€鍚庝竴鏉＄湡榫欙紝鎷ユ湁姣佺伃涓栫晫鐨勫姏閲忋€?},
  {id:'star_archmage',name:'鏄熻景澶ф硶甯?,icon:'馃尃',role:'mage',quality:'mythic',skills:['blizzard','soul_burn','arcane_shield'],lore:'浠ユ槦杈颁负鍔涢噺鐨勮嚦楂樺ぇ娉曞笀锛屼竴蹇典箣闂村彲鏀瑰彉澶╄薄銆?},
];

// 鍚堟垚閰嶆柟锛堝凡绉婚櫎闄愬埗锛屼换鎰忚嫳闆勫彲铻嶅悎锛?const MERGE_RECIPES = [];

// 鍏冲崱鏁版嵁
const STAGES = [
  // === 绗竴绔狅細鐭垮潙娣卞 (1-5) ===
  {id:1,name:'搴熷純鐭垮潙',icon:'鉀忥笍',desc:'鏇剧粡绻佽崳鐨勭熆鍧戯紝濡備粖琚骸鐏靛崰鎹?,enemies:[
    {name:'鐭垮潙楠烽珔',icon:'馃拃',role:'warrior',quality:'common',level:1,skills:['cleave']},
    {name:'鐭垮潙楠烽珔',icon:'馃拃',role:'warrior',quality:'common',level:1,skills:['shield_bash']},
  ],rewards:{gold:80,exp:30,stone:20}},
  {id:2,name:'骞芥殫鐭块亾',icon:'馃暞锔?,desc:'鐭块亾娣卞鐨勯粦鏆椾腑锛屼紶鏉ラ樀闃靛樁鍚?,enemies:[
    {name:'鑵愬寲铦欒潬',icon:'馃',role:'assassin',quality:'common',level:2,skills:['backstab']},
    {name:'鑵愬寲铦欒潬',icon:'馃',role:'assassin',quality:'common',level:2,skills:['backstab']},
    {name:'鐭垮潙楠烽珔',icon:'馃拃',role:'warrior',quality:'common',level:2,skills:['cleave']},
  ],rewards:{gold:100,exp:40,stone:25}},
  {id:3,name:'姘存櫠娲炵┐',icon:'馃拵',desc:'闂儊鐫€璇″紓鍏夎姃鐨勬按鏅舵礊绌?,enemies:[
    {name:'鐭垮潙楠烽珔',icon:'馃拃',role:'warrior',quality:'common',level:3,skills:['cleave','shield_bash']},
    {name:'姘存櫠铚樿洓',icon:'馃暦锔?,role:'ranger',quality:'common',level:3,skills:['aimed_shot']},
    {name:'姘存櫠铚樿洓',icon:'馃暦锔?,role:'ranger',quality:'common',level:3,skills:['aimed_shot']},
  ],rewards:{gold:120,exp:50,stone:30,herbs:10}},
  {id:4,name:'鐭胯剦娣卞',icon:'鉀忥笍',desc:'瓒婂線娣卞璧帮紝浜＄伒瓒婂己澶?,enemies:[
    {name:'鏆楀奖鐭垮伐',icon:'鉀忥笍',role:'warrior',quality:'rare',level:4,skills:['cleave','berserker']},
    {name:'鑵愬寲铦欒潬',icon:'馃',role:'assassin',quality:'common',level:4,skills:['poison_blade','backstab']},
    {name:'鑵愬寲铦欒潬',icon:'馃',role:'assassin',quality:'common',level:4,skills:['backstab']},
  ],rewards:{gold:150,exp:60,stone:35,herbs:15}},
  // 鈽?灏廈oss锛氱涓€绔燘oss
  {id:5,name:'馃拃 鐭垮潙棰嗕富',icon:'馃拃',desc:'鐭垮潙鐨勭粺娌昏€咃紝涓€浣嶅爼钀界殑鐭汉棰嗕富',isBoss:true,bossType:'mini',
    enemies:[
    {name:'鐭垮潙楠烽珔',icon:'馃拃',role:'warrior',quality:'common',level:4,skills:['cleave']},
    {name:'鐭垮潙楠烽珔',icon:'馃拃',role:'warrior',quality:'common',level:4,skills:['shield_bash']},
    {name:'鐭垮潙棰嗕富',icon:'馃懝',role:'warrior',quality:'rare',level:6,skills:['berserker','cleave','shield_bash']},
  ],rewards:{gold:250,exp:100,stone:50,herbs:20}},

  // === 绗簩绔狅細骞芥殫妫灄 (6-10) ===
  {id:6,name:'骞芥殫妫灄',icon:'馃尣',desc:'琚粦鏆楃缃╃殑妫灄锛屽厖婊′簡鏈煡鐨勫嵄闄?,enemies:[
    {name:'鏆楀奖鐙?,icon:'馃惡',role:'assassin',quality:'common',level:5,skills:['backstab']},
    {name:'鏆楀奖鐙?,icon:'馃惡',role:'assassin',quality:'common',level:5,skills:['poison_blade']},
    {name:'鏍戜汉瀹堝崼',icon:'馃尦',role:'guardian',quality:'rare',level:5,skills:['taunt','iron_wall']},
  ],rewards:{gold:180,exp:70,stone:40,herbs:20}},
  {id:7,name:'姣掗浘娌兼辰',icon:'馃尗锔?,desc:'寮ユ极鐫€姣掗浘鐨勬布娉藉湴',enemies:[
    {name:'姣掕洐',icon:'馃惛',role:'warlock',quality:'common',level:6,skills:['curse']},
    {name:'姣掕洐',icon:'馃惛',role:'warlock',quality:'common',level:6,skills:['life_drain']},
    {name:'娌兼辰宸ㄨ煉',icon:'馃悕',role:'warrior',quality:'rare',level:6,skills:['poison_blade','cleave']},
  ],rewards:{gold:200,exp:80,stone:45,herbs:25}},
  {id:8,name:'绮剧伒搴熷',icon:'馃彌锔?,desc:'绮剧伒鏃忔浘缁忕殑鍦ｅ湴锛屽浠婂凡鎴愬簾澧?,enemies:[
    {name:'鍫曡惤绮剧伒',icon:'馃',role:'ranger',quality:'rare',level:7,skills:['aimed_shot','rain_arrows']},
    {name:'鍫曡惤绮剧伒',icon:'馃',role:'ranger',quality:'rare',level:7,skills:['aimed_shot']},
    {name:'鏆楀奖鐙?,icon:'馃惡',role:'assassin',quality:'common',level:7,skills:['backstab','shadow_step']},
  ],rewards:{gold:230,exp:90,stone:50,herbs:30}},
  {id:9,name:'鍙ゆ爲涔嬪績',icon:'馃尦',desc:'妫灄涓ぎ鐨勫崈骞村彜鏍戯紝鏁ｅ彂鐫€璇″紓鐨勫姏閲?,enemies:[
    {name:'鏍戠簿',icon:'馃尦',role:'guardian',quality:'rare',level:8,skills:['taunt','iron_wall']},
    {name:'鏍戠簿',icon:'馃尦',role:'guardian',quality:'rare',level:8,skills:['taunt']},
    {name:'鑺卞',icon:'馃尭',role:'mage',quality:'rare',level:8,skills:['blizzard','arcane_shield']},
  ],rewards:{gold:260,exp:100,stone:55,herbs:35}},
  // 鈽?灏廈oss锛氱浜岀珷Boss
  {id:10,name:'馃惡 妫灄瀹堝崼鑰?,icon:'馃惡',desc:'妫灄鐨勬渶缁堝畧鍗紝涓€鍙榛戞殫渚佃殌鐨勮繙鍙ゅ法鐙?,isBoss:true,bossType:'mini',
    enemies:[
    {name:'鏍戠簿',icon:'馃尦',role:'guardian',quality:'rare',level:8,skills:['taunt','iron_wall']},
    {name:'鑺卞',icon:'馃尭',role:'mage',quality:'rare',level:8,skills:['blizzard']},
    {name:'杩滃彜宸ㄧ嫾',icon:'馃惡',role:'assassin',quality:'epic',level:10,skills:['shadow_step','backstab','poison_blade']},
  ],rewards:{gold:400,exp:160,stone:70,herbs:40}},

  // === 绗笁绔狅細鍝ュ竷鏋楃帇鍥?(11-15) ===
  {id:11,name:'鍝ュ竷鏋楀墠鍝?,icon:'馃彆锔?,desc:'鍝ュ竷鏋楅儴钀界殑鍓嶅摠绔?,enemies:[
    {name:'鍝ュ竷鏋楁垬澹?,icon:'馃懞',role:'warrior',quality:'rare',level:9,skills:['cleave','shield_bash']},
    {name:'鍝ュ竷鏋楁垬澹?,icon:'馃懞',role:'warrior',quality:'rare',level:9,skills:['cleave']},
    {name:'鍝ュ竷鏋楀紦鎵?,icon:'馃徆',role:'ranger',quality:'common',level:9,skills:['aimed_shot','rain_arrows']},
  ],rewards:{gold:280,exp:110,stone:60,herbs:35}},
  {id:12,name:'鍝ュ竷鏋楄惀鍦?,icon:'馃敟',desc:'鍝ュ竷鏋楅儴钀界殑鏍稿績钀ュ湴',enemies:[
    {name:'鍝ュ竷鏋楁垬澹?,icon:'馃懞',role:'warrior',quality:'rare',level:10,skills:['berserker','cleave']},
    {name:'鍝ュ竷鏋楄惃婊?,icon:'馃',role:'mage',quality:'rare',level:10,skills:['fireball','blizzard']},
    {name:'鍝ュ竷鏋楀紦鎵?,icon:'馃徆',role:'ranger',quality:'rare',level:10,skills:['rain_arrows','trap']},
  ],rewards:{gold:320,exp:130,stone:65,herbs:40}},
  {id:13,name:'鍝ュ竷鏋楃熆鍦?,icon:'鉀忥笍',desc:'鍝ュ竷鏋楀己杩ゴ闅跺紑閲囩殑鐭垮満',enemies:[
    {name:'鍝ュ竷鏋楃洃宸?,icon:'馃懝',role:'warrior',quality:'epic',level:11,skills:['berserker','cleave','shield_bash']},
    {name:'鍝ュ竷鏋楄惃婊?,icon:'馃',role:'mage',quality:'rare',level:11,skills:['fireball','curse']},
    {name:'鍝ュ竷鏋楀紦鎵?,icon:'馃徆',role:'ranger',quality:'rare',level:11,skills:['aimed_shot']},
  ],rewards:{gold:360,exp:150,stone:70,herbs:45}},
  {id:14,name:'鍝ュ竷鏋楄濉?,icon:'馃彴',desc:'鍧氬浐鐨勫摜甯冩灄瑕佸锛岄槻寰℃．涓?,enemies:[
    {name:'鍝ュ竷鏋楃簿閿?,icon:'馃懞',role:'warrior',quality:'epic',level:12,skills:['berserker','cleave']},
    {name:'鍝ュ竷鏋楃簿閿?,icon:'馃懞',role:'warrior',quality:'epic',level:12,skills:['shield_bash','cleave']},
    {name:'鍝ュ竷鏋楄惃婊?,icon:'馃',role:'mage',quality:'epic',level:12,skills:['blizzard','fireball']},
    {name:'鍝ュ竷鏋楀紦鎵?,icon:'馃徆',role:'ranger',quality:'rare',level:12,skills:['rain_arrows']},
  ],rewards:{gold:400,exp:170,stone:80,herbs:50}},
  // 鈽?灏廈oss锛氱涓夌珷Boss
  {id:15,name:'馃懝 鍝ュ竷鏋楃帇',icon:'馃懝',desc:'鍝ュ竷鏋楅儴钀界殑鑷抽珮缁熸不鑰咃紝娈嬫毚鑰岀嫛鐚?,isBoss:true,bossType:'mini',
    enemies:[
    {name:'鍝ュ竷鏋楃簿閿?,icon:'馃懞',role:'warrior',quality:'epic',level:12,skills:['berserker','cleave']},
    {name:'鍝ュ竷鏋楄惃婊?,icon:'馃',role:'mage',quality:'epic',level:12,skills:['blizzard','fireball']},
    {name:'鍝ュ竷鏋楃帇',icon:'馃懝',role:'warrior',quality:'epic',level:14,skills:['berserker','cleave','shield_bash']},
  ],rewards:{gold:600,exp:250,stone:100,herbs:60,gems:3}},

  // === 绗洓绔狅細鍦颁笅澧撶┐ (16-20) ===
  {id:16,name:'澧撶┐鍏ュ彛',icon:'鈿帮笍',desc:'鍙や唬鐜嬫棌鐨勫鍦板叆鍙ｏ紝闃撮闃甸樀',enemies:[
    {name:'浜＄伒楠戝＋',icon:'馃拃',role:'warrior',quality:'epic',level:13,skills:['cleave','shield_bash']},
    {name:'浜＄伒娉曞笀',icon:'馃懟',role:'mage',quality:'epic',level:13,skills:['blizzard','soul_burn']},
    {name:'楠烽珔寮撴墜',icon:'馃徆',role:'ranger',quality:'rare',level:13,skills:['aimed_shot','rain_arrows']},
  ],rewards:{gold:420,exp:180,stone:85,herbs:50}},
  {id:17,name:'鍦颁笅澧撶┐',icon:'馃拃',desc:'澧撶┐娣卞锛屼骸鐏电殑鍔涢噺瓒婃潵瓒婂己',enemies:[
    {name:'浜＄伒楠戝＋',icon:'馃拃',role:'warrior',quality:'epic',level:14,skills:['berserker','cleave']},
    {name:'浜＄伒娉曞笀',icon:'馃懟',role:'mage',quality:'epic',level:14,skills:['soul_burn','blizzard','arcane_shield']},
    {name:'澧撶┐瀹堝崼',icon:'馃椏',role:'guardian',quality:'epic',level:14,skills:['taunt','iron_wall']},
  ],rewards:{gold:460,exp:200,stone:90,herbs:55}},
  {id:18,name:'鐜嬫棌鐏垫',icon:'馃憫',desc:'鍙や唬鍥界帇鐨勭伒娈匡紝鍏呮弧浜嗚瘏鍜掍箣鍔?,enemies:[
    {name:'鏆楀奖楠戝＋',icon:'馃拃',role:'warrior',quality:'legendary',level:15,skills:['berserker','cleave','shield_bash']},
    {name:'浜＄伒娉曞笀',icon:'馃懟',role:'mage',quality:'epic',level:15,skills:['soul_burn','blizzard']},
    {name:'鏆楀奖鍒哄',icon:'馃懁',role:'assassin',quality:'epic',level:15,skills:['shadow_step','backstab','poison_blade']},
  ],rewards:{gold:500,exp:220,stone:100,herbs:60,gems:2}},
  {id:19,name:'娣辨笂涔嬮棬',icon:'馃寑',desc:'閫氬線娣辨笂鐨勫ぇ闂紝榛戞殫鍔涢噺鐨勬簮澶?,enemies:[
    {name:'鏆楀奖楠戝＋',icon:'馃拃',role:'warrior',quality:'legendary',level:16,skills:['berserker','cleave','shield_bash']},
    {name:'鏆楀奖娉曞笀',icon:'馃懟',role:'mage',quality:'legendary',level:16,skills:['soul_burn','blizzard','arcane_shield']},
    {name:'娣辨笂瀹堝崼',icon:'馃椏',role:'guardian',quality:'legendary',level:16,skills:['taunt','iron_wall','shield_bash_g']},
    {name:'鏆楀奖鍒哄',icon:'馃懁',role:'assassin',quality:'epic',level:16,skills:['shadow_step','backstab']},
  ],rewards:{gold:550,exp:250,stone:110,herbs:65,gems:3}},
  // 鈽呪槄鈽?澶oss锛氭渶缁圔oss 鈽呪槄鈽?  {id:20,name:'馃槇 娣辨笂棰嗕富',icon:'馃槇',desc:'娣辨笂鐨勬渶缁堢粺娌昏€咃紝涓€鍒囬粦鏆楀姏閲忕殑婧愬ご',isBoss:true,bossType:'final',
    enemies:[
    {name:'娣辨笂瀹堝崼',icon:'馃椏',role:'guardian',quality:'legendary',level:16,skills:['taunt','iron_wall']},
    {name:'鏆楀奖娉曞笀',icon:'馃懟',role:'mage',quality:'legendary',level:17,skills:['soul_burn','blizzard','arcane_shield']},
    {name:'娣辨笂棰嗕富',icon:'馃槇',role:'warlock',quality:'mythic',level:20,skills:['curse','life_drain','soul_burn']},
  ],rewards:{gold:2000,exp:1000,stone:300,herbs:150,gems:20}},
];

// 鏃犻檺鍏冲崱鐢熸垚
var ENEMY_NAMES=[
  {names:['鐭垮潙楠烽珔','鑵愬寲铦欒潬','鏆楀奖鐭垮伐'],icon:['馃拃','馃','鉀忥笍'],roles:['warrior','assassin','warrior']},
  {names:['鏆楀奖鐙?,'鏍戜汉瀹堝崼','姣掕洐'],icon:['馃惡','馃尦','馃惛'],roles:['assassin','guardian','warlock']},
  {names:['鍝ュ竷鏋楁垬澹?,'鍝ュ竷鏋楀紦鎵?,'鍝ュ竷鏋楄惃婊?],icon:['馃懞','馃徆','馃'],roles:['warrior','ranger','mage']},
  {names:['浜＄伒楠戝＋','浜＄伒娉曞笀','楠烽珔寮撴墜'],icon:['馃拃','馃懟','馃徆'],roles:['warrior','mage','ranger']},
  {names:['鏆楀奖楠戝＋','娣辨笂瀹堝崼','鏆楀奖鍒哄'],icon:['馃拃','馃椏','馃懁'],roles:['warrior','guardian','assassin']},
  {names:['鎭堕瓟鍗＋','鐏劙鎭堕瓟','鏆楀奖鎭堕瓟'],icon:['馃懝','馃敟','馃懁'],roles:['guardian','mage','assassin']},
  {names:['铏氱┖琛岃€?,'铏氱┖鐚庢墜','铏氱┖娉曞笀'],icon:['馃寑','馃憗锔?,'馃敭'],roles:['assassin','ranger','mage']},
];
var BOSS_NAMES=[
  {name:'鐭垮潙棰嗕富',icon:'馃懝',role:'warrior'},{name:'杩滃彜宸ㄧ嫾',icon:'馃惡',role:'assassin'},
  {name:'鍝ュ竷鏋楃帇',icon:'馃懝',role:'warrior'},{name:'娣辨笂棰嗕富',icon:'馃槇',role:'warlock'},
  {name:'鎭堕瓟灏嗗啗',icon:'馃懣',role:'warrior'},{name:'铏氱┖涔嬩富',icon:'馃寑',role:'mage'},
  {name:'娣锋矊棰嗕富',icon:'馃槇',role:'warlock'},{name:'姣佺伃鑰?,icon:'馃拃',role:'warrior'},
];
var AREA_THEMES=[
  {prefix:'搴熷純',suffix:'鐭垮潙',icon:'鉀忥笍'},{prefix:'骞芥殫',suffix:'妫灄',icon:'馃尣'},
  {prefix:'鍝ュ竷鏋?,suffix:'钀ュ湴',icon:'馃敟'},{prefix:'鍦颁笅',suffix:'澧撶┐',icon:'鈿帮笍'},
  {prefix:'鎭堕瓟',suffix:'绁潧',icon:'馃敟'},{prefix:'铏氱┖',suffix:'瑁傞殭',icon:'馃寑'},
  {prefix:'娣锋矊',suffix:'娣辨笂',icon:'馃槇'},{prefix:'杩滃彜',suffix:'閬楄抗',icon:'馃彌锔?},
];

function getStage(id){
  if(id<=STAGES.length)return STAGES[id-1];
  return generateStage(id);
}

// 鍏冲崱闅惧害閰嶇疆
const STAGE_CONFIG = {
  // 姣?0鍏充竴涓懆鏈燂紙鍛ㄧ洰锛?  cycleLength: 20,
  // 绛夌骇鏇茬嚎: 鍩虹绛夌骇 + 鍛ㄦ湡鍔犳垚 + 浣嶇疆鍔犳垚
  baseLevel: function(id, cycle, posInCycle) {
    return 1 + Math.floor(id * 0.8) + cycle * 3 + Math.floor(posInCycle / 5);
  },
  // 鏁屼汉鏁? 浠?涓€愭笎澧炲姞鍒?涓?  enemyCount: function(posInCycle, isBoss, isFinalBoss) {
    if (isFinalBoss) return 6;
    if (isBoss) return 4;
    return Math.min(6, 1 + Math.floor((posInCycle - 1) / 3));
  },
  // 鍝佽川鏇茬嚎: 鏅€氣啋绋€鏈夆啋鍙茶瘲鈫掍紶璇粹啋绁炶瘽
  qualityCurve: function(cycle, posInCycle, isBoss, isFinalBoss) {
    var qIdx = cycle;
    if (isFinalBoss) qIdx = Math.min(4, cycle + 2);
    else if (isBoss) qIdx = Math.min(4, cycle + 1);
    else qIdx = Math.min(4, cycle + Math.floor(posInCycle / 10));
    return QUALITIES[qIdx] || 'common';
  },
  // 鎶€鑳芥暟閲? 闅忚繘搴﹀鍔?  skillCount: function(cycle, posInCycle, isBoss) {
    if (isBoss) return 3;
    return Math.min(3, 1 + Math.floor(cycle / 2) + Math.floor(posInCycle / 10));
  }
};

// 鏁屼汉闃靛妯℃澘锛堢‘淇濇湁鍓嶆帓銆佽緭鍑恒€佽緟鍔╂惌閰嶏級
const ENEMY_FORMATIONS = [
  // 1浜? 鍗曚竴杈撳嚭
  [{role:'warrior',weight:1},{role:'assassin',weight:1},{role:'mage',weight:1}],
  // 2浜? 鍧﹀厠+杈撳嚭
  [{role:'guardian',weight:1},{role:'warrior',weight:1},{role:'mage',weight:1}],
  // 3浜? 鍧﹀厠+杈撳嚭+杈撳嚭/杈呭姪
  [{role:'guardian',weight:1},{role:'warrior',weight:1},{role:'mage',weight:1},{role:'assassin',weight:1},{role:'healer',weight:0.5}],
  // 4浜? 鍧﹀厠+2杈撳嚭+杈呭姪
  [{role:'guardian',weight:1},{role:'warrior',weight:1},{role:'mage',weight:1},{role:'assassin',weight:1},{role:'ranger',weight:1},{role:'healer',weight:1}],
  // 5浜? 鍧﹀厠+3杈撳嚭+杈呭姪
  [{role:'guardian',weight:1},{role:'warrior',weight:1},{role:'mage',weight:1},{role:'assassin',weight:1},{role:'ranger',weight:1},{role:'warlock',weight:1},{role:'healer',weight:1}],
  // 6浜? 瀹屾暣闃靛
  [{role:'guardian',weight:1},{role:'paladin',weight:1},{role:'warrior',weight:1},{role:'mage',weight:1},{role:'assassin',weight:1},{role:'ranger',weight:1},{role:'warlock',weight:1},{role:'healer',weight:1}]
];

function generateStage(id){
  var cycle=Math.floor((id-1)/STAGE_CONFIG.cycleLength);
  var posInCycle=((id-1)%STAGE_CONFIG.cycleLength)+1;
  var isBoss=(posInCycle%5===0);
  var isFinalBoss=(posInCycle===STAGE_CONFIG.cycleLength);
  var baseLevel=STAGE_CONFIG.baseLevel(id,cycle,posInCycle);
  var areaIdx=cycle%AREA_THEMES.length;
  var theme=AREA_THEMES[areaIdx];
  var enemyQuality=STAGE_CONFIG.qualityCurve(cycle,posInCycle,isBoss,isFinalBoss);
  var bossQuality=isFinalBoss?'mythic':STAGE_CONFIG.qualityCurve(cycle,posInCycle,true,false);
  
  var enemies=[];
  var nameSuffix=' 绗?+Math.ceil(posInCycle/5)+'灞?;
  
  if(isFinalBoss){
    // 鏈€缁圔oss: 6浜哄畬鏁撮樀瀹癸紝楂樺搧璐?    var bi=cycle%BOSS_NAMES.length;
    enemies.push({name:BOSS_NAMES[bi].name,icon:BOSS_NAMES[bi].icon,role:BOSS_NAMES[bi].role,quality:'mythic',level:baseLevel+5,skills:pickRandomSkills(BOSS_NAMES[bi].role,3)});
    enemies.push({name:'娣辨笂瀹堝崼',icon:'馃椏',role:'guardian',quality:'legendary',level:baseLevel+3,skills:pickRandomSkills('guardian',3)});
    enemies.push({name:'鏆楀奖鍒哄',icon:'馃懁',role:'assassin',quality:'legendary',level:baseLevel+3,skills:pickRandomSkills('assassin',3)});
    enemies.push({name:'娣锋矊娉曞笀',icon:'馃敭',role:'mage',quality:'legendary',level:baseLevel+3,skills:pickRandomSkills('mage',3)});
    enemies.push({name:'铏氱┖绁徃',icon:'馃憗锔?,role:'warlock',quality:'epic',level:baseLevel+2,skills:pickRandomSkills('warlock',2)});
    enemies.push({name:'榛戞殫鍖诲笀',icon:'馃拃',role:'healer',quality:'epic',level:baseLevel+2,skills:pickRandomSkills('healer',2)});
  }else if(isBoss){
    // 灏廈oss: 4浜洪樀瀹?    var bi=cycle%BOSS_NAMES.length;
    enemies.push({name:BOSS_NAMES[bi].name,icon:BOSS_NAMES[bi].icon,role:BOSS_NAMES[bi].role,quality:bossQuality,level:baseLevel+3,skills:pickRandomSkills(BOSS_NAMES[bi].role,3)});
    enemies.push({name:'绮捐嫳瀹堝崼',icon:'馃洝锔?,role:'guardian',quality:enemyQuality,level:baseLevel+1,skills:pickRandomSkills('guardian',2)});
    enemies.push({name:'鏆楀奖娉曞笀',icon:'馃懟',role:'mage',quality:enemyQuality,level:baseLevel+1,skills:pickRandomSkills('mage',2)});
    enemies.push({name:'榛戞殫鍖诲笀',icon:'馃拃',role:'healer',quality:enemyQuality,level:baseLevel,skills:pickRandomSkills('healer',1)});
  }else{
    // 鏅€氬叧鍗? 鏍规嵁浣嶇疆鍐冲畾浜烘暟鍜岄樀瀹?    var count=STAGE_CONFIG.enemyCount(posInCycle,isBoss,isFinalBoss);
    var formation=ENEMY_FORMATIONS[Math.min(count-1,ENEMY_FORMATIONS.length-1)];
    var ei=(cycle+Math.floor(posInCycle/3))%ENEMY_NAMES.length;
    var en=ENEMY_NAMES[ei];
    
    // 纭繚鏈夊墠鎺?    var hasTank=false;
    for(var i=0;i<count;i++){
      var role;
      if(i===0 && count>=2){
        // 绗竴涓綅缃紭鍏堝潶鍏?        role=Math.random()<0.7?'guardian':(Math.random()<0.5?'warrior':'paladin');
        hasTank=true;
      }else{
        // 鍏朵粬浣嶇疆鎸夐樀瀹规潈閲嶉殢鏈?        var pool=formation;
        var totalWeight=pool.reduce(function(s,r){return s+r.weight},0);
        var rand=Math.random()*totalWeight;
        var cumWeight=0;
        for(var j=0;j<pool.length;j++){
          cumWeight+=pool[j].weight;
          if(rand<=cumWeight){role=pool[j].role;break;}
        }
        if(!role)role=pool[0].role;
      }
      
      // 鏍规嵁浣嶇疆璋冩暣绛夌骇锛堝墠鎺掔瓑绾х暐楂橈級
      var lvlOffset=(role==='guardian'||role==='paladin')?1:0;
      var ni=i%en.names.length;
      enemies.push({
        name:en.names[ni],
        icon:en.icon[ni],
        role:role,
        quality:enemyQuality,
        level:baseLevel+lvlOffset,
        skills:pickRandomSkills(role,STAGE_CONFIG.skillCount(cycle,posInCycle,isBoss))
      });
    }
  }

  // 濂栧姳璁＄畻锛氫笌褰撳墠璧勬簮鎸傞挬锛堣祫婧愯秺灏戝鍔辫秺澶氾紝榧撳姳娑堣€楋級
  var difficultyMult=1+cycle*0.3+(isBoss?0.5:0)+(isFinalBoss?1:0);
  
  // 璁＄畻璧勬簮姣斾緥锛堣秺灏戝鍔辫秺澶氾紝鏈€澶?鍊嶅姞鎴愶級
  var goldRatio=(G.resources.gold||0)/RESOURCE_LIMITS.gold;
  var foodRatio=(G.resources.food||0)/RESOURCE_LIMITS.food;
  var stoneRatio=(G.resources.stone||0)/RESOURCE_LIMITS.stone;
  var ironRatio=(G.resources.iron||0)/RESOURCE_LIMITS.iron;
  
  // 璧勬簮绋€缂哄姞鎴愶細0璧勬簮=2鍊嶏紝婊¤祫婧?0.5鍊?  var goldBonus=2-Math.min(goldRatio*1.5,1.5);
  var resourceBonus=2-Math.min((foodRatio+stoneRatio+ironRatio)/3*1.5,1.5);
  
  // 閲戝竵/缁忛獙锛氫笌閲戝竵瀛橀噺鎸傞挬锛堥噾甯佸皯鏃跺鍔卞锛?  var baseGold=Math.floor((60+id*20)*difficultyMult*(1/(1+cycle*0.2)));
  var goldR=Math.floor(baseGold*goldBonus);
  var expR=Math.floor((25+id*10)*difficultyMult*(1/(1+cycle*0.15))*goldBonus);
  
  // 鐭虫潗/鑽夎嵂/閾佺熆锛氫笌璧勬簮瀛橀噺鎸傞挬锛堣祫婧愬皯鏃跺鍔卞锛?  var stoneR=Math.floor((15+id*4)*difficultyMult*(1/(1+cycle*0.3))*resourceBonus);
  var herbsR=Math.floor(id*1.5*difficultyMult*(1/(1+cycle*0.25))*resourceBonus);
  var ironR=Math.floor((8+id*2)*difficultyMult*(1/(1+cycle*0.35))*resourceBonus);
  
  // 瀹濈煶锛欱OSS鎺夎惤锛屼笌瀹濈煶瀛橀噺鎸傞挬锛堝疂鐭冲皯鏃舵帀钀藉锛?  var gemsR=0;
  if(isBoss){
    var gemRatio=(G.resources.gems||0)/RESOURCE_LIMITS.gems;
    var gemBonus=2-Math.min(gemRatio*1.5,1.5);
    if(isFinalBoss){
      gemsR=Math.floor((3+Math.min(cycle*1.5,5))*gemBonus); // 鏈€缁圔OSS锛?-8瀹濈煶
    }else{
      gemsR=Math.floor((1+Math.min(cycle*0.8,2))*gemBonus); // 灏廈OSS锛?-3瀹濈煶
    }
  }

  return {
    id:id,
    name:(isFinalBoss?'鈽呪槄鈽?':isBoss?'鈽?':'')+theme.prefix+theme.suffix+nameSuffix,
    icon:theme.icon,
    desc:'绗?+(cycle+1)+'绔?绗?+posInCycle+'鍏?路 鏁屼汉'+enemies.length+'浜?,
    isBoss:isBoss,
    bossType:isFinalBoss?'final':isBoss?'mini':null,
    enemies:enemies,
    rewards:{gold:goldR,exp:expR,stone:stoneR,herbs:herbsR,iron:ironR,gems:gemsR}
  };
}

function pickRandomSkills(role,count){
  var all={
    warrior:['cleave','shield_bash','berserker'],
    guardian:['taunt','iron_wall','shield_bash'],
    mage:['fireball','blizzard','arcane_shield','soul_burn'],
    healer:['heal','group_heal','purify','divine_shield'],
    assassin:['backstab','shadow_step','poison_blade'],
    ranger:['aimed_shot','rain_arrows','trap'],
    warlock:['curse','life_drain','soul_burn'],
    paladin:['holy_strike','divine_shield','holy_light'],
  };
  var pool=all[role]||all.warrior;
  var result=[];
  var shuffled=pool.slice().sort(function(){return Math.random()-0.5});
  for(var i=0;i<Math.min(count,shuffled.length);i++)result.push(shuffled[i]);
  return result;
}

// 瑁呭鏁版嵁
const EQUIP_TEMPLATES = [
  {id:'rusty_sword',name:'鐢熼攬鐨勫墤',icon:'馃棥锔?,type:'weapon',quality:'common',stats:{atk:3},desc:'涓€鎶婅€佹棫鐨勫墤锛屼絾渚濈劧閿嬪埄銆?},
  {id:'wooden_shield',name:'鏈ㄧ浘',icon:'馃洝锔?,type:'armor',quality:'common',stats:{def:3},desc:'绠€鍗曠殑鏈ㄧ浘锛岃亰鑳滀簬鏃犮€?},
  {id:'leather_armor',name:'鐨敳',icon:'馃',type:'armor',quality:'common',stats:{def:2,hp:10},desc:'杞讳究鐨勭毊鐢诧紝鎻愪緵鍩烘湰闃叉姢銆?},
  {id:'magic_ring',name:'榄旀硶鎴掓寚',icon:'馃拲',type:'accessory',quality:'common',stats:{mp:10},desc:'钑村惈寰急榄斿姏鐨勬垝鎸囥€?},
  {id:'iron_sword',name:'閾佸墤',icon:'鈿旓笍',type:'weapon',quality:'rare',stats:{atk:6},desc:'绮剧偧鐨勯搧鍓戯紝鍙潬鑰愮敤銆?},
  {id:'steel_shield',name:'閽㈢浘',icon:'馃洝锔?,type:'armor',quality:'rare',stats:{def:6,hp:15},desc:'鍧氬浐鐨勯挗鐩撅紝鑳芥湁鏁堟姷鎸℃敾鍑汇€?},
  {id:'mage_robe',name:'娉曞笀闀胯',icon:'馃Д',type:'armor',quality:'rare',stats:{def:3,mp:20},desc:'闄勬湁榄旀硶鍔犳垚鐨勯暱琚嶃€?},
  {id:'fire_amulet',name:'鐏劙鎶ょ',icon:'馃敟',type:'accessory',quality:'rare',stats:{atk:4,mp:10},desc:'钑村惈鐏劙涔嬪姏鐨勬姢绗︺€?},
  {id:'holy_blade',name:'鍦ｅ厜涔嬪垉',icon:'鉁?,type:'weapon',quality:'epic',stats:{atk:12,hp:20},desc:'娉ㄥ叆鍦ｅ厜鐨勫埄鍒冿紝瀵逛骸鐏垫湁濂囨晥銆?},
  {id:'dragon_armor',name:'榫欓碁鐢?,icon:'馃悏',type:'armor',quality:'epic',stats:{def:12,hp:40},desc:'鐢ㄩ緳槌為敾閫犵殑閾犵敳锛屽潥涓嶅彲鎽с€?},
  {id:'void_crown',name:'铏氱┖涔嬪啝',icon:'馃憫',type:'accessory',quality:'epic',stats:{atk:6,def:6,mp:15},desc:'鏉ヨ嚜铏氱┖鐨勭帇鍐狅紝璧嬩簣浣╂埓鑰呰秴鍑″姏閲忋€?},
  {id:'excalibur',name:'鐜嬭€呬箣鍓?,icon:'鈿旓笍',type:'weapon',quality:'legendary',stats:{atk:20,hp:30,spd:3},desc:'浼犺涓殑鍦ｅ墤锛屽彧鏈夎閫変腑鐨勫媷鑰呮墠鑳?wield銆?},
  {id:'abyss_shield',name:'娣辨笂涔嬬浘',icon:'馃敯',type:'armor',quality:'legendary',stats:{def:18,hp:60,mp:20},desc:'鏉ヨ嚜娣辨笂鐨勭浘鐗岋紝鑳芥姷寰′竴鍒囬偑鎭躲€?},
  {id:'chaos_orb',name:'娣锋矊涔嬬彔',icon:'馃敭',type:'accessory',quality:'mythic',stats:{atk:10,def:10,hp:50,mp:30,spd:5},desc:'娣锋矊鍔涢噺鐨勭粨鏅讹紝钑村惈鏃犻檺鍙兘銆?},
];

// 璧勬簮瀹氫箟
const RESOURCE_DEFS = {
  gold:   {name:'閲戝竵',  icon:'馃挵', desc:'鍩虹璐у竵锛岀敤浜庢嫑鍕熴€侀敾閫犮€佸缓閫?},
  gems:   {name:'瀹濈煶',  icon:'馃拵', desc:'楂樼骇璐у竵锛岀敤浜庨厭棣嗗拰绁炴鍗囩骇'},
  stone:  {name:'鐭虫潗',  icon:'馃', desc:'寤虹瓚鍗囩骇銆佽澶囬敾閫?},
  iron:   {name:'閾佺熆',  icon:'鉀忥笍', desc:'瑁呭閿婚€犳牳蹇冩潗鏂?},
  food:   {name:'椋熺墿',  icon:'馃崬', desc:'閰掗鍒锋柊娑堣€?},
  fame:   {name:'澹版湜',  icon:'馃弳', desc:'閰掗鍗囩骇鏉′欢锛岀珵鎶€鍦鸿幏鍙?},
};

// 寤虹瓚鏁版嵁
const BUILDING_DEFS = {
  tavern:    {
    name:'閰掗', icon:'馃嵑', 
    desc:'鎷涘嫙鏂拌嫳闆勶紝鍗囩骇瑙ｉ攣鏇撮珮鍝佽川鑻遍泟',
    maxLevel:10,
    baseCost:{gold:200, stone:30, food:10},
    // 澹版湜闇€姹傞殢绛夌骇閫掑锛堝墠鏈熶綆鍚庢湡楂橈級
    upgradeReqByLevel:{2:{fame:3},3:{fame:8},4:{fame:15},5:{fame:25},6:{fame:40},7:{fame:60},8:{fame:85},9:{fame:120},10:{fame:160}},
    effects:['瑙ｉ攣绋€鏈夊搧璐?路 3涓彲閫?,'绋€鏈夊嚭鐜扮巼+50% 路 3涓彲閫?,'瑙ｉ攣鍙茶瘲鍝佽川 路 4涓彲閫?,'鍙茶瘲鍑虹幇鐜?50% 路 4涓彲閫?,'瑙ｉ攣浼犺鍝佽川 路 4涓彲閫?,'5涓彲閫?路 浼犺鍑虹幇鐜?50%','瑙ｉ攣绁炶瘽鍝佽川 路 5涓彲閫?,'绁炶瘽鍑虹幇鐜?50% 路 5涓彲閫?,'绁炶瘽鍑虹幇鐜?100% 路 5涓彲閫?,'6涓彲閫?路 楂樼骇鍝佽川姒傜巼澶у箙鎻愬崌']
  },
  farm:{
    name:'鍐滃満', icon:'馃尵',
    desc:'鐢熶骇澶ч噺椋熺墿锛岀敤浜庨厭棣嗗埛鏂?,
    maxLevel:5,
    baseCost:{gold:80, stone:15},
    foodProductionByLevel:{1:100,2:200,3:350,4:550,5:800},
    effects:['姣忓皬鏃?100椋熺墿','姣忓皬鏃?200椋熺墿','姣忓皬鏃?350椋熺墿','姣忓皬鏃?550椋熺墿','姣忓皬鏃?800椋熺墿']
  },
  mine:      {
    name:'鐭垮満', icon:'鉀忥笍',
    desc:'寮€閲囩煶鏉愬拰閾佺熆',
    maxLevel:5,
    baseCost:{gold:150, stone:30},
    stoneProductionByLevel:{1:80,2:160,3:280,4:450,5:650},
    ironProductionByLevel:{1:30,2:60,3:100,4:150,5:220},
    effects:['姣忓皬鏃?80鐭虫潗,+30閾佺熆','姣忓皬鏃?160鐭虫潗,+60閾佺熆','姣忓皬鏃?280鐭虫潗,+100閾佺熆','姣忓皬鏃?450鐭虫潗,+150閾佺熆','姣忓皬鏃?650鐭虫潗,+220閾佺熆']
  },
  blacksmith:{
    name:'閾佸尃閾?, icon:'馃敤',
    desc:'閿婚€犺澶囷紝娑堣€楅搧鐭?,
    maxLevel:5,
    baseCost:{gold:200, stone:30, iron:5},
    forgeQualityByLevel:{1:'common',2:'rare',3:'epic',4:'legendary',5:'mythic'},
    effects:['鍙敾閫犳櫘閫氳澶?,'鍙敾閫犵█鏈夎澶?,'鍙敾閫犲彶璇楄澶?,'鍙敾閫犱紶璇磋澶?,'鍙敾閫犵璇濊澶?]
  },
  temple:    {
    name:'绁炴', icon:'鉀?,
    desc:'鎻愬崌鑻遍泟绛夌骇涓婇檺',
    maxLevel:5,
    baseCost:{gold:400, gems:5},
    heroLevelCapByLevel:{0:20,1:40,2:60,3:80,4:100,5:120},
    effects:['鑻遍泟绛夌骇涓婇檺 40','鑻遍泟绛夌骇涓婇檺 60','鑻遍泟绛夌骇涓婇檺 80','鑻遍泟绛夌骇涓婇檺 100','鑻遍泟绛夌骇涓婇檺 120']
  },
  arena:     {
    name:'绔炴妧鍦?, icon:'馃彑锔?,
    desc:'鎸戞垬鑾峰彇澹版湜鍜岄噾甯?,
    maxLevel:3,
    baseCost:{gold:200, stone:30},
    effects:['姣忔棩2娆℃寫鎴?,'姣忔棩3娆℃寫鎴?,'姣忔棩5娆℃寫鎴?澹版湜濂栧姳']
  },
};

// 绔炴妧鍦洪厤缃?const ARENA_CONFIG = {
  // 姣忔棩鎸戞垬娆℃暟
  dailyChallengesByLevel:{1:2,2:3,3:5},
  // 闅惧害濂栧姳鍊嶇巼
  difficultyMultiplier:{easy:1,normal:1.5,hard:2.5},
  // 鍩虹濂栧姳锛堟牴鎹鎵嬬瓑绾ц绠楋級
  baseGoldReward:300,
  baseFameReward:15,
  // 杩炶儨鍔犳垚
  winStreakBonus:{2:0.2,3:0.3,5:0.5,10:1},
};

// 閰掗鍒锋柊閰嶇疆
const TAVERN_REFRESH = {
  // 鍒锋柊璐圭敤锛氬墠鏈熶究瀹溿€佸悗鏈熻吹锛堟寚鏁板闀匡級
  costByLevel:{
    1:{gold:50, food:10},
    2:{gold:100, food:15},
    3:{gold:200, food:25},
    4:{gold:400, food:40},
    5:{gold:800, food:60},
    6:{gold:1500, food:90},
    7:{gold:3000, food:130},
    8:{gold:6000, food:180},
    9:{gold:12000, food:250},
    10:{gold:25000, food:350}
  },
  maxQualityByLevel:{1:'rare',2:'rare',3:'epic',4:'epic',5:'legendary',6:'legendary',7:'mythic',8:'mythic',9:'mythic',10:'mythic'},
  optionsCount:{1:3,2:3,3:4,4:4,5:4,6:5,7:5,8:5,9:5,10:6}, // 鍙€夎嫳闆勬暟閲?  // 鍝佽川鍑虹幇鐜囧姞鎴愶紙涔樻硶鍊嶇巼锛屼綔鐢ㄤ簬褰撳墠鏈€楂樺彲瑙ｉ攣鍝佽川鐨勬潈閲嶏級
  // 璁╁啑浣欑瓑绾т篃鏈夊疄闄呮剰涔夛細楂樺搧璐ㄨ嫳闆勫嚭鐜版鐜囨彁鍗?  qualityWeightBoost:{1:0,2:0.5,3:0,4:0.5,5:0,6:0.5,7:0,8:0.5,9:1.0,10:1.5},
};

// ==================== 娓告垙鐘舵€?====================
let G = {
  resources: {gold:2000, gems:30, stone:200, iron:50, food:200, fame:0},
  heroes: [],
  team: [null,null,null,null,null,null],
  equipment: [],
  buildings: {tavern:1, farm:1, mine:0, blacksmith:0, temple:0, arena:0},
  stageProgress: 1,
  battleState: null,
  heroIdCounter: 0,
  // 绔炴妧鍦虹姸鎬?  arenaState:{
    dailyChallengesUsed:0,
    lastChallengeDate:'',
    winStreak:0,
    totalWins:0,
    totalLosses:0,
  },
};

// ==================== 瀛樻。绯荤粺 ====================
const SAVE_KEY='shadow_dungeon_save';

function saveGame(){
  try{
    var data={g:G,heroIdCounter:G.heroIdCounter};
    localStorage.setItem(SAVE_KEY,JSON.stringify(data));
    showToast('馃捑 宸插瓨妗?);
  }catch(e){showToast('瀛樻。澶辫触');}
}

function loadGame(){
  try{
    var raw=localStorage.getItem(SAVE_KEY);
    if(!raw)return false;
    var data=JSON.parse(raw);
    // 鎭㈠鑻遍泟ID璁℃暟鍣?    G.heroIdCounter=data.heroIdCounter||0;
    // 鎭㈠娓告垙鐘舵€侊紙淇濈暀寮曠敤锛?    var saved=data.g;
    Object.keys(saved).forEach(function(k){G[k]=saved[k]});
    // 鎭㈠绔炴妧鍦烘瘡鏃ラ噸缃?    var today=new Date().toDateString();
    if(G.arenaState&&G.arenaState.lastChallengeDate!==today){
      G.arenaState.dailyChallengesUsed=0;
      G.arenaState.lastChallengeDate=today;
    }
    return true;
  }catch(e){console.error('璇绘。澶辫触',e);return false;}
}

function deleteSave(){
  if(!confirm('纭畾瑕佸垹闄ゅ瓨妗ｅ悧锛熸鎿嶄綔涓嶅彲鎾ら攢锛?))return;
  localStorage.removeItem(SAVE_KEY);
  showToast('馃棏锔?瀛樻。宸插垹闄?);
}

// ==================== H5鐙珛妯″紡妫€娴?====================
function isStandaloneMode(){
  return window.navigator.standalone===true||window.matchMedia('(display-mode: standalone)').matches;
}

var G_isH5Package=isStandaloneMode();

// ==================== 宸ュ叿鍑芥暟 ====================
function rand(min,max){return Math.floor(Math.random()*(max-min+1))+min}
function pick(arr){return arr[rand(0,arr.length-1)]}
function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
function deepClone(obj){return JSON.parse(JSON.stringify(obj))}

function showToast(msg,duration=2000){
  const root=document.getElementById('toast-root');
  if(!root)return;
  const t=document.createElement('div');t.className='toast';t.textContent=msg;
  root.appendChild(t);
  setTimeout(()=>t.remove(),duration);
}

function showModal(title,contentHTML,buttons=[]){
  const root=document.getElementById('modal-root');
  root.innerHTML=`<div class="modal-overlay" id="modal-overlay">
    <div class="modal">
      <div class="modal-title">${title}</div>
      <div class="modal-body">${contentHTML}</div>
      <div class="btn-group" style="margin-top:12px;justify-content:flex-end">
        ${buttons.map(b=>`<button class="btn ${b.cls||''}" onclick="${b.action}">${b.text}</button>`).join('')}
        <button class="btn" onclick="closeModal()">鍏抽棴</button>
      </div>
    </div>
  </div>`;
}
function closeModal(){document.getElementById('modal-root').innerHTML=''}

function updateResUI(){
  document.getElementById('res-gold').textContent=G.resources.gold;
  document.getElementById('res-gems').textContent=G.resources.gems;
  document.getElementById('res-food').textContent=G.resources.food;
  document.getElementById('res-fame').textContent=G.resources.fame;
  document.getElementById('res-stone').textContent=G.resources.stone;
  document.getElementById('res-iron').textContent=G.resources.iron;
}

// ==================== 鑻遍泟绯荤粺 ====================
function createHero(templateId,level=1){
  const tpl=HERO_TEMPLATES.find(t=>t.id===templateId);
  if(!tpl)return null;
  const role=ROLES[tpl.role];
  const qm=QUALITY_MULT[tpl.quality];
  const hero={
    uid: ++G.heroIdCounter,
    id:tpl.id, name:tpl.name, icon:tpl.icon,
    role:tpl.role, quality:tpl.quality,
    level:level, exp:0,
    maxHP: calcStat(role.baseHP, qm, level),
    hp:0,
    atk: calcStat(role.baseATK, qm, level),
    def: calcStat(role.baseDEF, qm, level),
    spd: calcStat(role.baseSPD, qm, level),
    maxMP: calcStat(role.baseMP, qm, level),
    mp:0,
    skills: [...tpl.skills],
    equipment:{weapon:null,armor:null,accessory:null},
    lore: tpl.lore,
    bonusSkills:[],
    deathDefyUsed: false,
  };
  hero.hp=hero.maxHP;
  hero.mp=hero.maxMP;
  return hero;
}

function getHeroStats(hero){
  let s={hp:hero.hp,maxHP:hero.maxHP,atk:hero.atk,def:hero.def,spd:hero.spd,mp:hero.mp,maxMP:hero.maxMP};
  // 瑁呭鍔犳垚
  for(let slot of ['weapon','armor','accessory']){
    const eid=hero.equipment[slot];
    if(eid!=null){
      const eq=G.equipment.find(e=>e.uid===eid);
      if(eq){
        const tpl=EQUIP_TEMPLATES.find(t=>t.id===eq.id);
        if(tpl){
          for(let[k,v]of Object.entries(tpl.stats)){
            if(s[k]!==undefined)s[k]+=v;
          }
        }
      }
    }
  }
  return s;
}

// ==================== 璧勬簮鐢熶骇绯荤粺 ====================
// 寤虹瓚姣忓垎閽熶骇鍑鸿祫婧愶紙杩涘叆寤虹瓚椤甸潰鏃惰Е鍙戯紝鍚屾椂鍚姩瀹氭椂鍣ㄨ嚜鍔ㄦ敹闆嗭級
var G_lastProductionTime=Date.now();
var G_productionTimer=null;

// 璧勬簮涓婇檺閰嶇疆
const RESOURCE_LIMITS = {
  gold: 50000,      // 閲戝竵涓婇檺
  gems: 999,        // 瀹濈煶涓婇檺
  food: 5000,       // 椋熺墿涓婇檺锛堟彁鍗囪緝澶氾級
  stone: 3000,      // 鐭虫潗涓婇檺
  iron: 1500,       // 閾佺熆涓婇檺
  fame: 999         // 澹版湜涓婇檺
};

function produceResources(){
  var now=Date.now();
  var minutesPassed=(now-G_lastProductionTime)/(1000*60);
  if(minutesPassed<0.02)return; // 灏忎簬1绉掍笉璁＄畻
  
  // 鍐滃満浜у嚭椋熺墿锛堥厤缃槸姣忓皬鏃朵骇閲忥紝杞崲涓烘瘡鍒嗛挓锛?  var farmLevel=G.buildings.farm||0;
  if(farmLevel>0){
    var farmDef=BUILDING_DEFS.farm;
    var foodPerHour=farmDef.foodProductionByLevel[farmLevel]||0;
    var foodPerMinute=foodPerHour/60;
    var foodProduced=Math.floor(foodPerMinute*minutesPassed);
    if(foodProduced>0){
      var before=G.resources.food||0;
      G.resources.food=Math.min((G.resources.food||0)+foodProduced, RESOURCE_LIMITS.food);
      var actual=G.resources.food-before;
      if(actual>0) showToast('馃尵 鍐滃満浜у嚭 '+actual+' 椋熺墿'+(G.resources.food>=RESOURCE_LIMITS.food?' (宸叉弧)':''));
    }
  }
  
  // 鐭垮満浜у嚭鐭虫潗鍜岄搧鐭匡紙閰嶇疆鏄瘡灏忔椂浜ч噺锛岃浆鎹负姣忓垎閽燂級
  var mineLevel=G.buildings.mine||0;
  if(mineLevel>0){
    var mineDef=BUILDING_DEFS.mine;
    var stonePerHour=mineDef.stoneProductionByLevel[mineLevel]||0;
    var ironPerHour=mineDef.ironProductionByLevel[mineLevel]||0;
    var stonePerMinute=stonePerHour/60;
    var ironPerMinute=ironPerHour/60;
    var stoneProduced=Math.floor(stonePerMinute*minutesPassed);
    var ironProduced=Math.floor(ironPerMinute*minutesPassed);
    
    var stoneBefore=G.resources.stone||0;
    var ironBefore=G.resources.iron||0;
    
    if(stoneProduced>0){
      G.resources.stone=Math.min((G.resources.stone||0)+stoneProduced, RESOURCE_LIMITS.stone);
    }
    if(ironProduced>0){
      G.resources.iron=Math.min((G.resources.iron||0)+ironProduced, RESOURCE_LIMITS.iron);
    }
    
    var stoneActual=(G.resources.stone||0)-stoneBefore;
    var ironActual=(G.resources.iron||0)-ironBefore;
    
    if(stoneActual>0||ironActual>0){
      var fullMsg='';
      if(G.resources.stone>=RESOURCE_LIMITS.stone) fullMsg+=' 鐭虫潗宸叉弧';
      if(G.resources.iron>=RESOURCE_LIMITS.iron) fullMsg+=' 閾佺熆宸叉弧';
      showToast('鉀忥笍 鐭垮満浜у嚭 '+stoneActual+' 鐭虫潗 '+ironActual+' 閾佺熆'+fullMsg);
    }
  }
  
  G_lastProductionTime=now;
  updateResUI();
}

// 鍚姩鑷姩璧勬簮鐢熶骇锛堟瘡15绉掓鏌ヤ竴娆★級
function startAutoProduction(){
  if(G_productionTimer)clearInterval(G_productionTimer);
  G_productionTimer=setInterval(function(){
     produceResources();
   }, 8000);
}

// 鎵嬪姩鏀堕泦璧勬簮锛堢偣鍑诲缓绛戦〉闈㈡椂瑙﹀彂锛?function collectResources(){
  produceResources();
}

// ==================== 绔炴妧鍦虹郴缁?====================
function getArenaDailyLimit(){
  var arenaLevel=G.buildings.arena||0;
  if(arenaLevel===0)return 0;
  return ARENA_CONFIG.dailyChallengesByLevel[arenaLevel]||0;
}

function getArenaRemainingChallenges(){
  var limit=getArenaDailyLimit();
  // 妫€鏌ユ槸鍚﹁法澶╅噸缃?  var today=new Date().toDateString();
  if(G.arenaState.lastChallengeDate!==today){
    G.arenaState.dailyChallengesUsed=0;
    G.arenaState.lastChallengeDate=today;
  }
  return Math.max(0,limit-G.arenaState.dailyChallengesUsed);
}

function generateArenaOpponent(difficulty){
  // 鑾峰彇鐜╁闃熶紞淇℃伅
  var teamHeroes=G.team.filter(function(h){return h!==null});
  var teamSize=teamHeroes.length;
  if(teamSize===0)teamSize=1;
  
  // 璁＄畻鐜╁闃熶紞骞冲潎绛夌骇鍜屽搧璐?  var totalLevel=0;
  var totalQuality=0;
  var maxPlayerLevel=0;
  teamHeroes.forEach(function(h){
    totalLevel+=h.level;
    totalQuality+=QUALITIES.indexOf(h.quality);
    if(h.level>maxPlayerLevel)maxPlayerLevel=h.level;
  });
  var avgPlayerLevel=Math.floor(totalLevel/teamSize);
  var avgPlayerQuality=Math.floor(totalQuality/teamSize);
  if(avgPlayerLevel===0)avgPlayerLevel=1;
  
  // 鏍规嵁闅惧害璋冩暣鍩虹绛夌骇
  var levelMultiplier={easy:0.6,normal:0.9,hard:1.2};
  var baseLevel=Math.floor(avgPlayerLevel*levelMultiplier[difficulty]);
  baseLevel=Math.max(1,baseLevel);
  
  // 鏍规嵁闅惧害璋冩暣鍝佽川涓婇檺
  var maxQualityIdx={easy:1,normal:3,hard:4}[difficulty]||2; // easy=绋€鏈?normal=鍙茶瘲,hard=浼犺
  
  // 瀵规墜浜烘暟涓庣帺瀹堕槦浼嶇浉鍚岋紙鏈€灏?浜猴紝鏈€澶?浜猴級
  var opponentCount=Math.min(Math.max(teamSize,2),4);
  
  // 鐢熸垚瀵规墜
  var opponents=[];
  for(var i=0;i<opponentCount;i++){
    // 鏍规嵁闅惧害閫夋嫨鍝佽川
    var qualityIdx=Math.min(maxQualityIdx,avgPlayerQuality+rand(-1,1));
    qualityIdx=Math.max(0,Math.min(qualityIdx,QUALITIES.length-1));
    var quality=QUALITIES[qualityIdx];
    
    // 閫夋嫨璇ュ搧璐ㄧ殑鑻遍泟妯℃澘
    var pool=HERO_TEMPLATES.filter(function(t){return t.quality===quality});
    if(pool.length===0)pool=HERO_TEMPLATES;
    var tpl=pick(pool);
    
    var role=ROLES[tpl.role];
    var qm=QUALITY_MULT[tpl.quality];
    
    // 绛夌骇鏈夐殢鏈烘尝鍔?    var levelVariation=rand(-2,3);
    var opponentLevel=Math.max(1,baseLevel+levelVariation);
    
    opponents.push({
      name:tpl.name,
      icon:tpl.icon,
      quality:tpl.quality,
      role:tpl.role,
      level:opponentLevel,
      hp:calcStat(role.baseHP,qm,opponentLevel),
      maxHP:calcStat(role.baseHP,qm,opponentLevel),
      atk:calcStat(role.baseATK,qm,opponentLevel),
      def:calcStat(role.baseDEF,qm,opponentLevel),
      spd:calcStat(role.baseSPD,qm,opponentLevel),
      mp:calcStat(role.baseMP,qm,opponentLevel),
      maxMP:calcStat(role.baseMP,qm,opponentLevel),
      skills:tpl.skills,
      alive:true,
      isEnemy:true,
    });
  }
  return opponents;
}

function calculateArenaReward(opponents,difficulty,isWin){
  if(!isWin)return{gold:0,fame:0};
  
  // 璁＄畻瀵规墜骞冲潎绛夌骇鍜屽搧璐?  var totalLevel=0;
  var totalQuality=0;
  opponents.forEach(function(o){
    totalLevel+=o.level;
    totalQuality+=QUALITIES.indexOf(o.quality);
  });
  var avgLevel=Math.floor(totalLevel/opponents.length);
  var avgQuality=Math.floor(totalQuality/opponents.length);
  
  var baseGold=ARENA_CONFIG.baseGoldReward;
  var baseFame=ARENA_CONFIG.baseFameReward;
  var diffMult=ARENA_CONFIG.difficultyMultiplier[difficulty]||1;
  
  // 鏍规嵁瀵规墜绛夌骇鍜屽搧璐ㄨ绠楀鍔?  var levelBonus=1+(avgLevel/100);
  var qualityBonus=1+(avgQuality*0.1); // 鍝佽川姣忛珮涓€绾?10%
  var countBonus=opponents.length*0.2; // 姣忓涓€涓鎵?20%
  
  var gold=Math.floor(baseGold*levelBonus*qualityBonus*(1+countBonus)*diffMult);
  var fame=Math.floor(baseFame*levelBonus*qualityBonus*(1+countBonus)*diffMult);
  
  // 杩炶儨鍔犳垚锛堜娇鐢ㄩ厤缃級
  var winStreak=G.arenaState.winStreak;
  var streakBonus=0;
  var streakThresholds=Object.keys(ARENA_CONFIG.winStreakBonus).map(Number).sort(function(a,b){return b-a});
  for(var i=0;i<streakThresholds.length;i++){
    if(winStreak>=streakThresholds[i]){streakBonus=ARENA_CONFIG.winStreakBonus[streakThresholds[i]];break;}
  }
  
  gold=Math.floor(gold*(1+streakBonus));
  fame=Math.floor(fame*(1+streakBonus));
  
  return{gold:gold,fame:fame};
}

function startArenaBattle(difficulty){
  var remaining=getArenaRemainingChallenges();
  if(remaining<=0){showToast('浠婃棩鎸戞垬娆℃暟宸茬敤瀹?);return}
  
  // 妫€鏌ユ槸鍚︽湁闃熶紞
  var teamHeroes=G.team.filter(function(h){return h!==null});
  if(teamHeroes.length===0){showToast('璇峰厛缂栫粍闃熶紞');return}
  
  // 鐢熸垚瀵规墜
  var opponents=generateArenaOpponent(difficulty);
  
  // 淇濆瓨绔炴妧鍦轰俊鎭緵鎴樻枟缁撴潫鍚庣粨绠?  G.arenaBattleInfo={
    difficulty:difficulty,
    opponents:opponents
  };
  
  // 鍚姩绔炴妧鍦烘垬鏂?  runArenaBattle(teamHeroes,opponents,difficulty);
}

async function runArenaBattle(teamHeroes,opponents,difficulty){
  // 濡傛灉鎴樻枟宸插湪杩愯锛屼笉閲嶅鍚姩
  if(G_battleRunning){return;}
  G_battleRunning=true;
  G_battlePaused=false;
  
  // 鍒涘缓鐜╁鍗曚綅
  var playerUnits=teamHeroes.map(function(h){return createBattleUnit(h,false)});
  
  // 鍒涘缓瀵规墜鍗曚綅锛堢被浼煎叧鍗℃晫浜猴級
  var enemyUnits=opponents.map(function(e){
    // 鏋勫缓fakeHero瀵硅薄
    var fakeHero={
      name:e.name,
      icon:e.icon,
      role:e.role,
      quality:e.quality,
      level:e.level,
      skills:e.skills,
      bonusSkills:[],
      maxHP:e.maxHP,
      atk:e.atk,
      def:e.def,
      spd:e.spd,
      maxMP:e.maxMP,
      hp:e.hp,
      mp:e.mp,
      equipment:{weapon:null,armor:null,accessory:null}
    };
    return createBattleUnit(fakeHero,true);
  });
  
  var allUnits=playerUnits.concat(enemyUnits);
  
  // 淇濆瓨鎴樻枟鍗曚綅鍒板叏灞€锛屼緵閫€鍑烘椂妫€鏌ュ疄闄呰儨璐?  G.arenaBattleUnits={playerUnits:playerUnits,enemyUnits:enemyUnits};
  
  // 鍒濆鍖栨垬鏂楃粺璁℃暟鎹?  resetBattleStats();
  
  // 鍦ㄧ珵鎶€鍦洪〉闈㈠唴娓叉煋鎴樻枟鐣岄潰锛堜笉鍒囨崲tab锛?  var contentEl=document.getElementById('content');
  if(!contentEl){G_battleRunning=false;return;}
  
  var diffNames={easy:'馃煝绠€鍗?,normal:'馃煛鏅€?,hard:'馃敶鍥伴毦'};
  
  // 娓叉煋绔炴妧鍦烘垬鏂楃晫闈?  function renderArenaBattleUI(){
    contentEl.innerHTML=`<div class="panel">
      <div class="panel-title"><span class="icon">馃彑锔?/span> 绔炴妧鍦烘垬鏂?路 ${diffNames[difficulty]}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <div style="font-size:12px;color:var(--text2)">鍥炲悎: <span id="arena-round">1</span>/50</div>
        <div class="btn-group">
          <button class="btn btn-sm" onclick="exitArenaBattle()" style="color:#ff6b6b">馃毆 閫€鍑?/button>
          <button class="btn btn-sm ${G_battlePaused?'btn-primary':''}" onclick="toggleArenaPause()">${G_battlePaused?'鈻讹笍 缁х画':'鈴革笍 鏆傚仠'}</button>
          <button class="btn btn-sm" onclick="setArenaSpeed(1)">x1</button>
          <button class="btn btn-sm" onclick="setArenaSpeed(2)">x2</button>
          <button class="btn btn-sm" onclick="setArenaSpeed(4)">x4</button>
        </div>
      </div>
      <div id="arena-battle-scene" style="background:linear-gradient(180deg,#1a1a2e 0%,#16213e 100%);border-radius:8px;padding:15px;min-height:200px;position:relative">
        <div style="display:flex;justify-content:space-between;gap:20px">
          <div id="arena-player-team" style="flex:1"></div>
          <div id="arena-enemy-team" style="flex:1"></div>
        </div>
      </div>
      <div id="arena-battle-log" style="height:150px;overflow-y:auto;background:rgba(0,0,0,0.3);border-radius:6px;padding:10px;margin-top:10px;font-size:12px"></div>
      
      <!-- 鎴樻枟缁熻闈㈡澘 -->
      <div style="margin-top:10px;background:rgba(0,0,0,0.2);border-radius:6px;padding:10px">
        <div style="font-weight:bold;font-size:13px;margin-bottom:8px;color:var(--gold)">馃搳 鎴樻枟鏁版嵁</div>
        <div style="display:flex;gap:20px">
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;color:var(--text2);margin-bottom:4px">馃煝 鎴戞柟</div>
            <div id="arena-ally-stats"></div>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;color:var(--text2);margin-bottom:4px">馃敶 鏁屾柟</div>
            <div id="arena-enemy-stats"></div>
          </div>
        </div>
      </div>
      
      <div id="arena-battle-buttons" class="btn-group mt-8" style="justify-content:center"></div>
    </div>`;
  }
  
  renderArenaBattleUI();
  
  // 璁剧疆鎴樻枟鍦烘櫙寮曠敤锛屼娇鍔ㄧ敾鏁堟灉鍙敤
  _battleScene=document.getElementById('arena-battle-scene');
  
  var logEl=document.getElementById('arena-battle-log');
  var playerTeamEl=document.getElementById('arena-player-team');
  var enemyTeamEl=document.getElementById('arena-enemy-team');
  var roundEl=document.getElementById('arena-round');
  var btnArea=document.getElementById('arena-battle-buttons');
  
  if(!logEl||!playerTeamEl||!enemyTeamEl){G_battleRunning=false;return;}
  
  function log(msg,cls){
    cls=cls||'info';
    var line=document.createElement('div');
    line.className='log-line log-'+cls;
    line.textContent=msg;
    logEl.appendChild(line);
    logEl.scrollTop=logEl.scrollHeight;
  }
  
  function renderTeams(){
    playerTeamEl.innerHTML=playerUnits.map(function(u){
      var hpPct=Math.max(0,(u.hp/u.maxHP)*100);
      var mpPct=Math.max(0,(u.mp/u.maxMP)*100);
      var shieldPct=u.maxHP>0?Math.min(100,(u.shield/u.maxHP)*100):0;
      var isLow=hpPct<30;
      var roleIcon=ROLES[u.hero.role]?ROLES[u.hero.role].icon:'鈿旓笍';
      var buffsHTML=u.buffs.map(function(b){
        var isPos=b.mult>1||b.stat==='taunt'||b.stat==='dodge'||b.stat==='reflect'||b.stat==='stun';
        return '<span class="buff-tag '+(isPos?'buff-positive':'buff-negative')+'">'+(b.name||b.stat)+(b.duration>0?'('+b.duration+')':'')+'</span>';
      }).join('');
      var dotsHTML=u.dot.map(function(d){return '<span class="buff-tag buff-dot">'+d.name+'('+d.duration+')</span>'}).join('');
      return '<div class="battle-unit ally-unit '+(u.alive?'':'dead')+'" data-battle-uid="'+u.name+'-'+u.icon+'">'
        +'<div class="unit-avatar-wrap">'
        +'<div class="unit-role-icon">'+roleIcon+'</div>'
        +'<div class="unit-avatar quality-'+u.hero.quality+'">'+u.icon+'</div>'
        +'<div class="unit-level">'+u.hero.level+'</div>'
        +'</div>'
        +'<div class="unit-name">'+u.name+'</div>'
        +'<div class="unit-bars">'
        +'<div class="unit-bar"><span class="unit-bar-label">HP</span><div class="unit-bar-track"><div class="unit-bar-fill hp '+(isLow?'low':'')+'" style="width:'+hpPct+'%"></div></div><span class="unit-bar-val">'+Math.max(0,u.hp)+'/'+u.maxHP+'</span></div>'
        +'<div class="unit-bar"><span class="unit-bar-label">MP</span><div class="unit-bar-track"><div class="unit-bar-fill mp" style="width:'+mpPct+'%"></div></div><span class="unit-bar-val">'+u.mp+'/'+u.maxMP+'</span></div>'
        +(u.shield>0?'<div class="unit-bar unit-shield-bar"><span class="unit-bar-label" style="color:#54a0ff">馃洝</span><div class="unit-bar-track"><div class="unit-bar-fill shield-bar" style="width:'+shieldPct+'%"></div></div><span class="unit-bar-val" style="color:#54a0ff">'+u.shield+'</span></div>':'')
        +'</div>'
        +'<div class="unit-buffs">'+buffsHTML+dotsHTML+'</div>'
        +'</div>';
    }).join('');
    enemyTeamEl.innerHTML=enemyUnits.map(function(u){
      var hpPct=Math.max(0,(u.hp/u.maxHP)*100);
      var shieldPct=u.maxHP>0?Math.min(100,(u.shield/u.maxHP)*100):0;
      var isLow=hpPct<30;
      var roleIcon=ROLES[u.hero.role]?ROLES[u.hero.role].icon:'鈿旓笍';
      var buffsHTML=u.buffs.map(function(b){
        var isPos=b.mult>1||b.stat==='taunt'||b.stat==='dodge'||b.stat==='reflect'||b.stat==='stun';
        return '<span class="buff-tag '+(isPos?'buff-positive':'buff-negative')+'">'+(b.name||b.stat)+(b.duration>0?'('+b.duration+')':'')+'</span>';
      }).join('');
      var dotsHTML=u.dot.map(function(d){return '<span class="buff-tag buff-dot">'+d.name+'('+d.duration+')</span>'}).join('');
      return '<div class="battle-unit enemy-unit '+(u.alive?'':'dead')+'" data-battle-uid="'+u.name+'-'+u.icon+'">'
        +'<div class="unit-avatar-wrap">'
        +'<div class="unit-role-icon">'+roleIcon+'</div>'
        +'<div class="unit-avatar quality-'+u.hero.quality+'">'+u.icon+'</div>'
        +'<div class="unit-level">'+u.hero.level+'</div>'
        +'</div>'
        +'<div class="unit-name">'+u.name+'</div>'
        +'<div class="unit-bars">'
        +'<div class="unit-bar"><span class="unit-bar-label">HP</span><div class="unit-bar-track"><div class="unit-bar-fill hp '+(isLow?'low':'')+'" style="width:'+hpPct+'%"></div></div><span class="unit-bar-val">'+Math.max(0,u.hp)+'/'+u.maxHP+'</span></div>'
        +(u.shield>0?'<div class="unit-bar unit-shield-bar"><span class="unit-bar-label" style="color:#54a0ff">馃洝</span><div class="unit-bar-track"><div class="unit-bar-fill shield-bar" style="width:'+shieldPct+'%"></div></div><span class="unit-bar-val" style="color:#54a0ff">'+u.shield+'</span></div>':'')
        +'</div>'
        +'<div class="unit-buffs">'+buffsHTML+dotsHTML+'</div>'
        +'</div>';
    }).join('');
  }
  
  renderTeams();
  
  // 鎴樻枟涓诲惊鐜?  var round=0;
  var maxRounds=50;
  
  while(G_battleRunning&&round<maxRounds){
    if(G_battlePaused){await sleep(200);continue}
    round++;
    if(roundEl)roundEl.textContent=round;
    log('=== 绗?'+round+' 鍥炲悎 ===','round');
    
    // 鍥炲悎寮€濮嬪鐞?    for(var i=0;i<allUnits.length;i++){
      var u=allUnits[i];
      if(!u.alive)continue;
      // DOT浼ゅ
      if(u.dot&&u.dot.length>0){
        u.dot=u.dot.filter(function(d){
          var dotDmg=d.dmg;
          if(d.sourceRole==='warlock')dotDmg=Math.floor(dotDmg*1.5);
          u.hp=Math.max(0,u.hp-dotDmg);
          log(u.icon+u.name+' 鍙楀埌 '+d.name+'锛屾崯澶?'+dotDmg+' 鐢熷懡','debuff');
          showFloat(u,'-'+dotDmg+' '+d.name,'damage');
          animUnit(u,'hit',300);
          recordBattleStat(u,'damageTaken',dotDmg);
          if(u.hp<=0){u.alive=false;log(u.icon+' '+u.name+' 鍊掍笅浜?..','death');animUnit(u,'dying',700)}
          d.duration--;
          return d.duration>0;
        });
      }
      // BUFF鎸佺画鏃堕棿
      if(u.buffs&&u.buffs.length>0){
        u.buffs.forEach(function(b){if(b.duration)b.duration--});
        u.buffs=u.buffs.filter(function(b){return b.duration===undefined||b.duration>0});
      }
      // 鍐峰嵈
      if(u.cooldowns){
        for(var skillId in u.cooldowns){
          if(u.cooldowns[skillId]>0)u.cooldowns[skillId]--;
        }
      }
    }
    
    // 鎸夐€熷害鎺掑簭琛屽姩
    var turnOrder=allUnits.filter(function(u){return u.alive}).sort(function(a,b){return b.spd-a.spd});
    clearHighlight();
    
    for(var idx=0;idx<turnOrder.length;idx++){
      if(!G_battleRunning)break;
      if(G_battlePaused){await sleep(200);idx--;continue}
      
      var unit=turnOrder[idx];
      if(!unit||!unit.alive)continue;
      
      highlightUnit(unit);
      
      // 鐪╂檿妫€鏌?      var stunBuff=unit.buffs.find(function(b){return b.stat==='stun'});
      if(stunBuff){
        log(unit.icon+' '+unit.name+' 澶勪簬鐪╂檿鐘舵€侊紝鏃犳硶琛屽姩','debuff');
        showFloat(unit,'鐪╂檿','debuff-text');
        continue;
      }
      
      // AI鍐崇瓥 - 浣跨敤smartChooseSkill
      var smartChoice=smartChooseSkill(unit,allUnits);
      if(smartChoice){
        var skillId=smartChoice.id;
        var chosenSkill=smartChoice.skill;
        
        // 鎵ｉ櫎MP
        if(!(G_cheats.enabled && G_cheats.infiniteMP && !unit.isEnemy)){
          unit.mp-=chosenSkill.mpCost;
        }
        unit.cooldowns[skillId]=chosenSkill.cooldown;
        
        // 鏄剧ず鎶€鑳芥晥鏋?        var effectClass='fire';
        if(chosenSkill.name.indexOf('鍐?)>=0||chosenSkill.name.indexOf('鏆撮闆?)>=0)effectClass='ice';
        else if(chosenSkill.name.indexOf('鏆?)>=0||chosenSkill.name.indexOf('璇呭拻')>=0||chosenSkill.name.indexOf('鐏甸瓊')>=0)effectClass='dark';
        else if(chosenSkill.name.indexOf('鍦?)>=0||chosenSkill.name.indexOf('鍏?)>=0||chosenSkill.name.indexOf('鍑€鍖?)>=0)effectClass='holy';
        else if(chosenSkill.name.indexOf('姣?)>=0)effectClass='poison';
        else if(chosenSkill.type==='heal'||chosenSkill.type==='cleanse')effectClass='heal-effect';
        else if(chosenSkill.type==='shield')effectClass='shield-effect';
        
        showSkillEffect(chosenSkill.icon,chosenSkill.name,effectClass);
        showFloat(unit,chosenSkill.icon+chosenSkill.name,'skill-name');
        await sleep(400);
        
        var target=getValidTarget(unit,allUnits,chosenSkill.target);
        if(target){
          await executeSkillV2(unit,target,chosenSkill,allUnits,log);
        }
      }else{
        // 鏅€氭敾鍑?        var target=getValidTarget(unit,allUnits,'single_enemy');
        if(target){
          var r=calcDamage(unit,target,null);
          if(r.dodged){
            log(unit.icon+' '+unit.name+' 鏀诲嚮 '+target.icon+target.name+'锛屼絾琚棯閬夸簡锛?,'info');
            showFloat(target,'闂伩!','dodge');
            recordBattleStat(target,'dodge',1);
          }else{
            var dmg=r.dmg;
            if(target.shield>0){var absorbed=Math.min(target.shield,dmg);target.shield-=absorbed;dmg-=absorbed;if(absorbed>0)showFloat(target,'馃洝-'+absorbed,'shield-num')}
            target.hp=Math.max(0,target.hp-dmg);
            log(unit.icon+' '+unit.name+' 鏀诲嚮 '+target.icon+target.name+'锛岄€犳垚 '+dmg+' 鐐逛激瀹?+(r.crit?' 馃挜鏆村嚮锛?:''),r.crit?'crit':'damage');
            showFloat(target,(r.crit?'馃挜':'')+dmg,r.crit?'crit':'damage');
            animUnit(target,'hit',300);
            recordBattleStat(unit,'damage',dmg);
            recordBattleStat(target,'damageTaken',dmg);
            if(r.crit)recordBattleStat(unit,'crit',1);
            if(target.hp<=0){target.alive=false;log(target.icon+' '+target.name+' 鍊掍笅浜?..','death');animUnit(target,'dying',700)}
          }
        }
      }
      
      renderTeams();
      updateBattleStatsBoard();
      await sleep(500/G_battleSpeed);
    }
    
    renderTeams();
    
    // 妫€鏌ヨ儨璐?    var playerAlive=playerUnits.filter(function(u){return u.alive}).length;
    var enemyAlive=enemyUnits.filter(function(u){return u.alive}).length;
    
    if(playerAlive===0||enemyAlive===0){
      G_battleRunning=false;
      break;
    }
    
    await sleep(300/G_battleSpeed);
  }
  
  // 鎴樻枟缁撴潫 - 妫€鏌ユ槸鍚﹁涓€旈€€鍑烘墦鏂?  if(!G.arenaBattleInfo){return;}
  
  var playerAlive=playerUnits.filter(function(u){return u.alive}).length;
  var enemyAlive=enemyUnits.filter(function(u){return u.alive}).length;
  var isWin=playerAlive>0&&enemyAlive===0;
  
  // 銆愬叧閿€戠珛鍗充繚瀛樿儨璐熺粨鏋滃拰濂栧姳锛岄槻姝㈢敤鎴峰湪 await 闂撮殭鐐归€€鍑?  G.arenaIsWin=isWin;
  G.arenaReward=calculateArenaReward(G.arenaBattleInfo.opponents,G.arenaBattleInfo.difficulty,isWin);
  
  await finishArenaBattle(isWin,playerUnits,enemyUnits);
}

async function finishArenaBattle(isWin,playerUnits,enemyUnits){
  updateResUI();
  saveGame();
  renderTeams();
  G_battleRunning=false;
  G_battlePaused=false;
  
  // 淇濆瓨鑳滆礋缁撴灉鍒板叏灞€
  G.arenaIsWin=isWin;
  
  // 璁＄畻濂栧姳
  var info=G.arenaBattleInfo;
  var difficulty=info.difficulty;
  var opponents=info.opponents;
  var reward=calculateArenaReward(opponents,difficulty,isWin);
  G.arenaReward=reward;
  
  // 鏄剧ず缁撶畻鎻愮ず锛堥€氳繃Toast锛?  if(isWin){
    showToast('馃帀 绔炴妧鍦鸿儨鍒╋紒鑾峰緱 馃挵'+reward.gold+' 馃弳'+reward.fame);
  }else{
    showToast('馃拃 绔炴妧鍦哄け璐?..');
  }
  
  // 鏄剧ず鎴樻枟缁撴灉闈㈡澘锛堝姩鐢绘晥鏋滐級+ 鐭殏寤惰繜鍚庤嚜鍔ㄥ洖鍒扮珵鎶€鍦?  var btnArea=document.getElementById('arena-battle-buttons');
  if(btnArea){
    var resultText=isWin?'<span class="text-gold" style="font-size:20px;font-weight:bold">馃帀 绔炴妧鍦鸿儨鍒╋紒</span>':'<span class="text-red" style="font-size:20px;font-weight:bold">馃拃 绔炴妧鍦哄け璐?..</span>';
    var rewardText=isWin?'<div style="text-align:center;margin:12px 0;color:#ffd700;font-size:16px">濂栧姳: 馃挵'+reward.gold+' 馃弳'+reward.fame+'</div>':'';
    var streakText=isWin?'<div style="text-align:center;margin:8px 0;color:#2ed573">杩炶儨: '+G.arenaState.winStreak+'</div>':'';
    btnArea.innerHTML='<div style="margin:20px 0;text-align:center;padding:20px;background:rgba(0,0,0,0.3);border-radius:10px">'+resultText+rewardText+streakText+'</div>';
  }
  
  // 鑷姩缁撶畻锛堝欢杩熷悗杩斿洖绔炴妧鍦猴級
  G.arenaSettleTimer=setTimeout(function(){
    showArenaResult();
  }, 1500);
}

function showArenaResult(){
  var info=G.arenaBattleInfo;
  if(!info)return;
  
  var difficulty=info.difficulty;
  var isWin=G.arenaIsWin;
  var reward=G.arenaReward||{gold:0,fame:0};
  
  // 鏇存柊鐘舵€?  G.arenaState.dailyChallengesUsed++;
  
  if(isWin){
    G.arenaState.winStreak++;
    G.arenaState.totalWins++;
    G.resources.gold+=reward.gold;
    G.resources.fame+=reward.fame;
    updateResUI();
    showToast('鑾峰緱 馃挵'+reward.gold+' 馃弳'+reward.fame);
  }else{
    G.arenaState.winStreak=0;
    G.arenaState.totalLosses++;
  }
  
  // 鐩存帴娓叉煋绔炴妧鍦洪〉闈紙涓嶉€氳繃switchTab锛?  var contentEl=document.getElementById('content');
  if(contentEl){
    renderArena(contentEl);
  }
  
  // 璁＄畻鎴樻枟鏁版嵁姹囨€?  var totalDamage=0,totalHeal=0,totalTaken=0,totalCrit=0,totalDodge=0;
  var maxDamageUnit='',maxDamage=0;
  for(var k in G_battleStats){
    var s=G_battleStats[k];
    totalDamage+=s.damage||0;
    totalHeal+=s.heal||0;
    totalTaken+=s.damageTaken||0;
    totalCrit+=s.crit||0;
    totalDodge+=s.dodge||0;
    if((s.damage||0)>maxDamage){
      maxDamage=s.damage;maxDamageUnit=s.icon+s.name;
    }
  }
  
  // 鏄剧ず缁撴灉寮圭獥
  var diffNames={easy:'馃煝绠€鍗?,normal:'馃煛鏅€?,hard:'馃敶鍥伴毦'};
  var resultTitle=isWin?'馃帀 绔炴妧鍦鸿儨鍒╋紒':'馃拃 绔炴妧鍦哄け璐?..';
  var resultContent=
    '<div style="text-align:center;margin:8px 0;font-size:12px">闅惧害: '+diffNames[difficulty]+'</div>'+
    '<div style="text-align:center;font-size:18px;margin:16px 0">'+resultTitle+'</div>'+
    (isWin?
      '<div style="text-align:center;margin:8px 0">杩炶儨: <b style="color:#2ed573">'+G.arenaState.winStreak+'</b></div>'+
      '<div style="text-align:center;margin:8px 0">濂栧姳: <b style="color:#ffd700">馃挵'+reward.gold+'</b> <b style="color:#ff6b6b">馃弳'+reward.fame+'</b></div>'
    :'<div style="text-align:center;margin:8px 0;color:var(--red)">杩炶儨宸查噸缃?/div>')+
    '<div style="margin-top:12px;padding:10px;background:rgba(0,0,0,0.3);border-radius:6px">'+
    '<div style="font-weight:bold;font-size:12px;margin-bottom:6px;color:var(--gold)">馃搳 鎴樻枟鏁版嵁姹囨€?/div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px">'+
    '<span>鈿旓笍 鎬讳激瀹? <b style="color:#ff6b6b">'+totalDamage+'</b></span>'+
    '<span>馃挜 鏆村嚮娆℃暟: <b style="color:#ff4757">'+totalCrit+'</b></span>'+
    '<span>馃挌 鎬绘不鐤? <b style="color:#2ed573">'+totalHeal+'</b></span>'+
    '<span>馃挩 闂伩娆℃暟: <b style="color:#70a1ff">'+totalDodge+'</b></span>'+
    '<span style="grid-column:span 2">馃洝锔?鎬绘壙浼? <b style="color:#ffa502">'+totalTaken+'</b></span>'+
    '<span style="grid-column:span 2;color:var(--text2)">馃弲 鏈€楂樿緭鍑? '+maxDamageUnit+' ('+maxDamage+')</span>'+
    '</div></div>';
  
  showModal('绔炴妧鍦虹粨鏋?,resultContent,[{text:'纭畾',action:"closeModal()",cls:'btn-primary'}]);
  
  delete G.arenaBattleInfo;
  delete G.arenaIsWin;
  delete G.arenaReward;
  delete G.arenaBattleUnits;
  G.arenaSettleTimer=null;
}

function toggleArenaPause(){
  G_battlePaused=!G_battlePaused;
  // 鏌ユ壘鎺у埗鏍忎腑鐨勬殏鍋?缁х画鎸夐挳
  var allBtns=document.querySelectorAll('.panel .btn-group .btn');
  for(var i=0;i<allBtns.length;i++){
    var txt=allBtns[i].textContent;
    if(txt.indexOf('鈴革笍')>=0||txt.indexOf('鈻讹笍')>=0||txt.indexOf('鏆傚仠')>=0||txt.indexOf('缁х画')>=0){
      allBtns[i].textContent=G_battlePaused?'鈻讹笍 缁х画':'鈴革笍 鏆傚仠';
      allBtns[i].classList.toggle('btn-primary',G_battlePaused);
      break;
    }
  }
}

function setArenaSpeed(speed){
  G_battleSpeed=speed;
  showToast('鎴樻枟閫熷害: x'+speed);
}

function exitArenaBattle(){
  // 娓呴櫎鑷姩缁撶畻瀹氭椂鍣?  if(G.arenaSettleTimer){clearTimeout(G.arenaSettleTimer);G.arenaSettleTimer=null;}
  
  // 鎴樻枟杩樺湪杩涜涓?鈫?鏍规嵁瀹為檯鎴樻枟鐘舵€佸垽鏂儨璐?  if(G_battleRunning){
    var actualWin=false;
    if(G.arenaBattleUnits){
      var pAlive=G.arenaBattleUnits.playerUnits.filter(function(u){return u.alive}).length;
      var eAlive=G.arenaBattleUnits.enemyUnits.filter(function(u){return u.alive}).length;
      actualWin=pAlive>0&&eAlive===0;
    }
    if(actualWin){
      // 鏁屼汉閮芥浜嗭紝鏄儨鍒╋紝璁?async runArenaBattle 鑷繁妫€娴嬪苟缁撶畻
      G_battleRunning=false;
      G_battlePaused=false;
      showToast('馃帀 鎴樻枟鑳滃埄锛屾鍦ㄧ粨绠?..');
      return;
    }
    // 鐪熺殑杩樺湪鎵撴垨鍦ㄥけ璐ヨ竟缂?鈫?纭閫€鍑鸿涓哄け璐?    if(!confirm('纭畾瑕侀€€鍑虹珵鎶€鍦烘垬鏂楀悧锛焅n姝ゆ鎸戞垬娆℃暟灏嗘墸闄わ紝骞惰涓哄け璐ャ€?))return;
    G_battleRunning=false;
    G_battlePaused=false;
    _battleScene=null;
    G.arenaIsWin=false;
    G.arenaReward={gold:0,fame:0};
    showArenaResult();
    return;
  }
  
  // 鎴樻枟宸茶嚜鐒剁粨鏉?鈫?鐩存帴缁撶畻杩斿洖绔炴妧鍦猴紙淇′换宸叉湁鐨凣.arenaIsWin锛?  _battleScene=null;
  if(G.arenaBattleInfo){
    showArenaResult();
  }else{
    showToast('杩斿洖绔炴妧鍦?);
    var contentEl=document.getElementById('content');
    if(contentEl)renderArena(contentEl);
  }
}

function getHeroLevelCap(){
  var templeLevel=G.buildings.temple||0;
  var templeDef=BUILDING_DEFS.temple;
  return templeDef.heroLevelCapByLevel[templeLevel]||20;
}

function getExpToLevel(level){return Math.floor(50*Math.pow(1.25,level-1))}

function addHeroExp(hero,amount){
  var levelCap=getHeroLevelCap();
  if(hero.level>=levelCap)return false;
  hero.exp+=amount;
  let leveled=false;
  while(hero.exp>=getExpToLevel(hero.level)&&hero.level<levelCap){
    hero.exp-=getExpToLevel(hero.level);
    hero.level++;
    leveled=true;
    const role=ROLES[hero.role];const qm=QUALITY_MULT[hero.quality];
    hero.maxHP=calcStat(role.baseHP, qm, hero.level);
    hero.atk=calcStat(role.baseATK, qm, hero.level);
    hero.def=calcStat(role.baseDEF, qm, hero.level);
    hero.spd=calcStat(role.baseSPD, qm, hero.level);
    hero.maxMP=calcStat(role.baseMP, qm, hero.level);
    hero.hp=hero.maxHP;hero.mp=hero.maxMP;
  }
  // 瓒呭嚭涓婇檺鐨勭粡楠屾竻闆?  if(hero.level>=levelCap)hero.exp=0;
  return leveled;
}

// ==================== 鎴樻枟寮曟搸 ====================
function createBattleUnit(hero,isEnemy=false){
  const stats=getHeroStats(hero);
  return{
    hero:hero, isEnemy:isEnemy,
    name:hero.name, icon:hero.icon,
    hp:stats.maxHP, maxHP:stats.maxHP,
    mp:stats.maxMP, maxMP:stats.maxMP,
    atk:stats.atk, def:stats.def, spd:stats.spd,
    alive:true, shield:0,
    buffs:[], cooldowns:{},
    dot:[], // 鎸佺画浼ゅ
    bonusSkills: hero.bonusSkills||[],
  };
}

function calcDamage(attacker,defender,skill=null){
  // 閲戞墜鎸囷細涓€鍑诲繀鏉€锛堢帺瀹舵敾鍑绘椂锛?  if(G_cheats.enabled && G_cheats.oneHitKill && !attacker.isEnemy){
    return{dmg:999999,crit:true,dodged:false};
  }
  // 閲戞墜鎸囷細鏃犳晫锛堢帺瀹跺彈鍑绘椂锛?  if(G_cheats.enabled && G_cheats.godMode && !defender.isEnemy){
    return{dmg:0,crit:false,dodged:true};
  }
  let atk=attacker.atk;
  let def=defender.def;
  
  // 鑾峰彇鑱屼笟鏁版嵁
  const attackerRole=ROLES[attacker.role];
  const defenderRole=ROLES[defender.role];
  
  // buff/debuff
  attacker.buffs.forEach(b=>{if(b.stat==='atk')atk=Math.floor(atk*b.mult)});
  defender.buffs.forEach(b=>{if(b.stat==='def')def=Math.floor(def*b.mult)});
  
  // ===== 鑱屼笟鏈哄埗 =====
  
  // 鎴樺＋锛氱媯鎬?- 鐢熷懡鍊间綆浜?0%鏃舵敾鍑诲姏鎻愬崌50%
  if(attacker.role==='warrior' && attacker.hp/attacker.maxHP<0.3){
    atk=Math.floor(atk*1.5);
  }
  
  // 瀹堟姢鑰咃細閾佸 - 鍙楀埌浼ゅ鍑忓皯20%
  if(defender.role==='guardian'){
    def=Math.floor(def*1.2);
  }
  
  // 娉曞笀锛氬ゥ鏈簿閫?- 鎶€鑳戒激瀹虫彁鍗?0%
  if(attacker.role==='mage' && skill){
    atk=Math.floor(atk*1.3);
  }
  
  // 娓镐緺锛氱簿鍑?- 鏀诲嚮鏃犺鐩爣20%闃插尽
  if(attacker.role==='ranger'){
    def=Math.floor(def*0.8);
  }
  
  // 鍦ｉ獞澹細瀵逛骸鐏典激瀹?50%
  if(attacker.role==='paladin' && defender.isUndead){
    atk=Math.floor(atk*1.5);
  }
  
  // 鏈＋锛欴OT浼ゅ+50%锛堝湪executeSkill涓鐞嗭級
  
  // 鍩虹浼ゅ璁＄畻
  let mult=skill?skill.mult:1.0;
  let dmg=Math.max(1,Math.floor((atk*mult-def*0.5)*(0.9+Math.random()*0.2)));
  
  // 鏆村嚮璁＄畻锛堣€冭檻鑱屼笟鏆村嚮鐜囷級
  let crit=false;
  let critRate=attackerRole&&attackerRole.critRate?attackerRole.critRate:0.1;
  if(skill&&skill.critBonus)critRate+=skill.critBonus;
  
  // 鍒哄锛氭殫褰辨 - 鏆村嚮浼ゅ+50%
  let critDmg=attackerRole&&attackerRole.critDmg?attackerRole.critDmg:1.8;
  
  if(Math.random()<critRate){dmg=Math.floor(dmg*critDmg);crit=true}
  
  // 闂伩璁＄畻锛堣€冭檻鑱屼笟闂伩鐜囷級
  let dodgeChance=defenderRole&&defenderRole.dodgeRate?defenderRole.dodgeRate:0.05;
  defender.buffs.forEach(b=>{if(b.stat==='dodge')dodgeChance+=0.3});
  if(skill&&skill.alwaysHit)dodgeChance=0;
  if(Math.random()<dodgeChance)return{dmg:0,dodged:true,crit:false};
  
  // 鏈＋锛氱伒榄傝櫣鍚?- 閫犳垚浼ゅ鐨?5%杞寲涓虹敓鍛芥仮澶?  if(attacker.role==='warlock' && !attacker.isEnemy){
    const heal=Math.floor(dmg*0.15);
    attacker.hp=Math.min(attacker.maxHP,attacker.hp+heal);
  }
  
  return{dmg,crit,dodged:false};
}

function getValidTarget(unit,allUnits,targetType){
  const allies=allUnits.filter(u=>u.alive&&u.isEnemy===unit.isEnemy&&u!==unit);
  const enemies=allUnits.filter(u=>u.alive&&u.isEnemy!==unit.isEnemy);
  // 妫€鏌ュ槻璁?  if(targetType.includes('enemy')){
    const taunter=enemies.find(u=>u.buffs.some(b=>b.stat==='taunt'));
    if(taunter&&targetType==='single_enemy')return taunter;
  }
  switch(targetType){
    case 'single_enemy': return pick(enemies);
    case 'all_enemies': return enemies;
    case 'single_ally': return pick(allies.filter(u=>u.hp<u.maxHP))||pick(allies.length>0?allies:[unit]);
    case 'all_allies': return allUnits.filter(u=>u.alive&&u.isEnemy===unit.isEnemy);
    case 'self': return unit;
    default: return pick(enemies);
  }
}

async function executeSkill(user,target,skill,allUnits,logFn){
  const targets=Array.isArray(target)?target:[target];
  switch(skill.type){
    case 'damage':{
      targets.forEach(t=>{
        if(!t.alive)return;
        const r=calcDamage(user,t,skill);
        if(r.dodged){logFn(`${user.icon} ${user.name} 浣跨敤 ${skill.icon}${skill.name}锛屼絾 ${t.icon}${t.name} 闂伩浜嗭紒`,'info');return}
        let dmg=r.dmg;
        if(t.shield>0){const absorbed=Math.min(t.shield,dmg);t.shield-=absorbed;dmg-=absorbed}
        t.hp=Math.max(0,t.hp-dmg);
        logFn(`${user.icon} ${user.name} 浣跨敤 ${skill.icon}${skill.name} 瀵?${t.icon}${t.name} 閫犳垚 ${dmg} 鐐逛激瀹?{r.crit?' 馃挜鏆村嚮锛?:''}`,r.crit?'crit':'damage');
        if(skill.stunChance&&Math.random()<skill.stunChance){
          t.buffs.push({stat:'stun',duration:1,name:'鐪╂檿'});
          logFn(`${t.icon}${t.name} 琚湬鏅曚簡锛乣,'debuff');
        }
        if(skill.dot){
          t.dot.push({dmg:Math.floor(user.atk*skill.dot.dmgPct),duration:skill.dot.duration,name:'涓瘨'});
          logFn(`${t.icon}${t.name} 琚柦鍔犱簡 ${skill.dot.name}锛乣,'debuff');
        }
        if(skill.debuff){
          const db=skill.debuff;
          if(db.stat==='all'){
            t.buffs.push({stat:'atk',mult:db.mult,duration:db.duration,name:'璇呭拻-鏀?});
            t.buffs.push({stat:'def',mult:db.mult,duration:db.duration,name:'璇呭拻-闃?});
          }else{
            t.buffs.push({stat:db.stat,mult:db.mult,duration:db.duration,name:'鍓婂急'});
          }
          logFn(`${t.icon}${t.name} 琚墛寮变簡锛乣,'debuff');
        }
        if(t.hp<=0){t.alive=false;logFn(`${t.icon} ${t.name} 鍊掍笅浜?..`,'death')}
      });break;
    }
    case 'heal':{
      targets.forEach(t=>{
        if(!t.alive)return;
        const heal=Math.floor(t.maxHP*skill.healPct);
        t.hp=Math.min(t.maxHP,t.hp+heal);
        logFn(`${user.icon} ${user.name} 浣跨敤 ${skill.icon}${skill.name}锛屾仮澶?${t.icon}${t.name} ${heal} 鐐圭敓鍛絗,'heal');
      });break;
    }
    case 'buff':{
      targets.forEach(t=>{
        if(!t.alive)return;
        t.buffs.push({...skill.buff,name:skill.name});
        logFn(`${user.icon} ${user.name} 浣跨敤 ${skill.icon}${skill.name}锛?{t===user?'鑷韩':'闃熷弸'}鑾峰緱澧炵泭鏁堟灉`,'buff');
      });break;
    }
    case 'shield':{
      targets.forEach(t=>{
        if(!t.alive)return;
        const amt=Math.floor(t.maxHP*skill.shieldPct);
        t.shield+=amt;
        logFn(`${user.icon} ${user.name} 浣跨敤 ${skill.icon}${skill.name}锛屼负 ${t.icon}${t.name} 娣诲姞 ${amt} 鐐规姢鐩綻,'buff');
      });break;
    }
    case 'drain':{
      targets.forEach(t=>{
        if(!t.alive)return;
        const r=calcDamage(user,t,skill);
        if(r.dodged){logFn(`${user.icon} ${user.name} 浣跨敤 ${skill.icon}${skill.name}锛屼絾 ${t.icon}${t.name} 闂伩浜嗭紒`,'info');return}
        let dmg=r.dmg;
        if(t.shield>0){const absorbed=Math.min(t.shield,dmg);t.shield-=absorbed;dmg-=absorbed}
        t.hp=Math.max(0,t.hp-dmg);
        const healAmt=Math.floor(dmg*0.5);
        user.hp=Math.min(user.maxHP,user.hp+healAmt);
        logFn(`${user.icon} ${user.name} 浣跨敤 ${skill.icon}${skill.name}锛屽 ${t.icon}${t.name} 閫犳垚 ${dmg} 浼ゅ锛屾仮澶?${healAmt} 鐢熷懡`,'skill');
        if(t.hp<=0){t.alive=false;logFn(`${t.icon} ${t.name} 鍊掍笅浜?..`,'death')}
      });break;
    }
    case 'debuff':{
      targets.forEach(t=>{
        if(!t.alive)return;
        const db=skill.debuff;
        if(db.stat==='all'){
          t.buffs.push({stat:'atk',mult:db.mult,duration:db.duration,name:'璇呭拻-鏀?});
          t.buffs.push({stat:'def',mult:db.mult,duration:db.duration,name:'璇呭拻-闃?});
        }else{
          t.buffs.push({stat:db.stat,mult:db.mult,duration:db.duration,name:'璇呭拻'});
        }
        logFn(`${user.icon} ${user.name} 浣跨敤 ${skill.icon}${skill.name}锛?{t.icon}${t.name} 琚瘏鍜掍簡锛乣,'debuff');
      });break;
    }
    case 'cleanse':{
      targets.forEach(t=>{
        if(!t.alive)return;
        const negCount=t.buffs.filter(b=>b.stat==='stun'||b.stat==='atk'&&b.mult<1||b.stat==='def'&&b.mult<1).length;
        t.buffs=t.buffs.filter(b=>!(b.stat==='stun'||(b.stat==='atk'&&b.mult<1)||(b.stat==='def'&&b.mult<1)));
        t.dot=[];
        logFn(`${user.icon} ${user.name} 浣跨敤 ${skill.icon}${skill.name}锛屾竻闄や簡 ${t.icon}${t.name} 鐨?${negCount} 涓礋闈㈡晥鏋渀,'heal');
      });break;
    }
  }
}

// ==================== 鏅鸿兘鎴樻枟AI ====================
function smartChooseSkill(unit,allUnits){
  var role=unit.hero.role;
  var allies=allUnits.filter(function(u){return u.alive&&u.isEnemy===unit.isEnemy&&u!==unit});
  var enemies=allUnits.filter(function(u){return u.alive&&u.isEnemy!==unit.isEnemy});
  var allAlive=allUnits.filter(function(u){return u.alive});

  // 鑾峰彇鍙敤鎶€鑳?  var available=[];
  var allSkillIds=[].concat(unit.hero.skills,unit.bonusSkills);
  allSkillIds.forEach(function(sid){
    var sk=SKILLS[sid];if(!sk)return;
    if(unit.mp<sk.mpCost)return;
    if(unit.cooldowns[sid]>0)return;
    available.push({id:sid,skill:sk});
  });
  if(available.length===0)return null;

  // 璁＄畻鎴樺満鎬佸娍
  var allyHurtCount=allies.filter(function(a){return a.hp<a.maxHP*0.5}).length;
  var allyCriticalCount=allies.filter(function(a){return a.hp<a.maxHP*0.25}).length;
  var selfHurtPct=unit.hp/unit.maxHP;
  var enemyCount=enemies.length;
  var hasAllyDebuff=allies.some(function(a){return a.buffs.some(function(b){return b.stat==='stun'||(b.stat==='atk'&&b.mult<1)||(b.stat==='def'&&b.mult<1)})||a.dot.length>0});
  var hasEnemyBuff=enemies.some(function(e){return e.buffs.some(function(b){return b.stat==='taunt'})});
  var lowestAlly=null;var lowestPct=1;
  allies.concat([unit]).forEach(function(a){var p=a.hp/a.maxHP;if(p<lowestPct){lowestPct=p;lowestAlly=a}});
  var lowestEnemy=null;var lowestEnemyPct=1;
  enemies.forEach(function(e){var p=e.hp/e.maxHP;if(p<lowestEnemyPct){lowestEnemyPct=p;lowestEnemy=e}});

  // 鎸夎鑹插畾浣嶅垎绛栫暐
  if(role==='healer'){
    // 娌绘剤鑰咃細浼樺厛娌荤枟锛屽叾娆″噣鍖?    if(allyCriticalCount>=2){
      var gh=available.find(function(s){return s.skill.type==='heal'&&s.skill.target==='all_allies'});
      if(gh)return gh;
    }
    if(allyHurtCount>0||selfHurtPct<0.6){
      var heal=available.find(function(s){return s.skill.type==='heal'&&s.skill.target==='single_ally'});
      if(heal)return heal;
      var gh2=available.find(function(s){return s.skill.type==='heal'});
      if(gh2)return gh2;
    }
    if(hasAllyDebuff){
      var cleanse=available.find(function(s){return s.skill.type==='cleanse'});
      if(cleanse)return cleanse;
    }
    return null; // 娌℃不鐤楅渶姹傚氨鏅敾
  }

  if(role==='guardian'){
    // 瀹堟姢鑰咃細鍢茶>閾佸>鐩惧嚮
    if(!unit.buffs.some(function(b){return b.stat==='taunt'})){
      var taunt=available.find(function(s){return s.skill.type==='buff'&&s.skill.buff&&s.skill.buff.stat==='taunt'});
      if(taunt&&enemyCount>1)return taunt;
    }
    if(allyHurtCount>=2){
      var iw=available.find(function(s){return s.skill.type==='buff'&&s.skill.buff&&s.skill.buff.stat==='def'});
      if(iw)return iw;
    }
    var dmg=available.find(function(s){return s.skill.type==='damage'});
    if(dmg)return dmg;
    return null;
  }

  if(role==='paladin'){
    // 鍦ｉ獞澹細娌荤枟>鎶ょ浘>杈撳嚭
    if(allyCriticalCount>=2){
      var gh=available.find(function(s){return s.skill.type==='heal'&&s.skill.target==='all_allies'});
      if(gh)return gh;
    }
    if(lowestAlly&&lowestPct<0.4){
      var ds=available.find(function(s){return s.skill.type==='shield'});
      if(ds)return ds;
      var heal=available.find(function(s){return s.skill.type==='heal'});
      if(heal)return heal;
    }
    var atk=available.find(function(s){return s.skill.type==='damage'});
    if(atk)return atk;
    return null;
  }

  if(role==='mage'){
    // 娉曞笀锛欰OE>鎶ょ浘>鍗曚綋鐖嗗彂
    if(enemyCount>=2){
      var aoe=available.find(function(s){return s.skill.type==='damage'&&s.skill.target==='all_enemies'});
      if(aoe)return aoe;
    }
    if(allyHurtCount>=2){
      var sh=available.find(function(s){return s.skill.type==='shield'});
      if(sh)return sh;
    }
    // 鍗曚綋楂樹激瀹?    var singles=available.filter(function(s){return s.skill.type==='damage'&&s.skill.target==='single_enemy'});
    singles.sort(function(a,b){return b.skill.mult-a.skill.mult});
    if(singles.length>0)return singles[0];
    return null;
  }

  if(role==='assassin'){
    // 鍒哄锛氭殫褰辨(浣庤閲忔椂)>姣掑垉>鑳屽埡
    if(selfHurtPct<0.5){
      var ss=available.find(function(s){return s.skill.type==='buff'&&s.skill.buff&&s.skill.buff.stat==='dodge'});
      if(ss)return ss;
    }
    // 浼樺厛缁欐病DOT鐨勭洰鏍囦笂姣?    var poison=available.find(function(s){return s.skill.dot});
    if(poison){
      var noDotEnemy=enemies.find(function(e){return e.dot.length===0});
      if(noDotEnemy)return poison;
    }
    var highDmg=available.find(function(s){return s.skill.type==='damage'&&s.skill.mult>=1.5});
    if(highDmg)return highDmg;
    var anyDmg=available.find(function(s){return s.skill.type==='damage'});
    if(anyDmg)return anyDmg;
    return null;
  }

  if(role==='warlock'){
    // 鏈＋锛氳瘏鍜?鐢熷懡姹插彇>鐏甸瓊鐏肩儳
    var curse=available.find(function(s){return s.skill.type==='debuff'});
    if(curse){
      var noCurse=enemies.find(function(e){return !e.buffs.some(function(b){return b.stat==='atk'&&b.mult<1})});
      if(noCurse)return curse;
    }
    if(selfHurtPct<0.7){
      var drain=available.find(function(s){return s.skill.type==='drain'});
      if(drain)return drain;
    }
    var dot=available.find(function(s){return s.skill.dot});
    if(dot){
      var noDot=enemies.find(function(e){return e.dot.length===0});
      if(noDot)return dot;
    }
    var anyDmg=available.find(function(s){return s.skill.type==='damage'});
    if(anyDmg)return anyDmg;
    return null;
  }

  if(role==='ranger'){
    // 娓镐緺锛欰OE>绮惧噯灏勫嚮>闄烽槺
    if(enemyCount>=3){
      var aoe=available.find(function(s){return s.skill.type==='damage'&&s.skill.target==='all_enemies'});
      if(aoe)return aoe;
    }
    var aimed=available.find(function(s){return s.skill.type==='damage'&&s.skill.alwaysHit});
    if(aimed)return aimed;
    if(selfHurtPct<0.6&&!unit.buffs.some(function(b){return b.stat==='reflect'})){
      var trap=available.find(function(s){return s.skill.type==='buff'&&s.skill.buff&&s.skill.buff.stat==='reflect'});
      if(trap)return trap;
    }
    var anyDmg=available.find(function(s){return s.skill.type==='damage'});
    if(anyDmg)return anyDmg;
    return null;
  }

  // 鎴樺＋(榛樿)锛氬厛寮€buff>AOE>鍗曚綋
  if(role==='warrior'){
    var atkBuff=available.find(function(s){return s.skill.type==='buff'&&s.skill.buff&&s.skill.buff.stat==='atk'});
    if(atkBuff&&!unit.buffs.some(function(b){return b.stat==='atk'&&b.mult>1})){
      if(enemyCount>=2||enemies.some(function(e){return e.hp>e.maxHP*0.5}))return atkBuff;
    }
    if(enemyCount>=2){
      var aoe=available.find(function(s){return s.skill.type==='damage'&&s.skill.target==='all_enemies'});
      if(aoe)return aoe;
    }
    var dmg=available.find(function(s){return s.skill.type==='damage'});
    if(dmg)return dmg;
    return null;
  }

  // 鍏滃簳锛氫紭鍏堜激瀹虫妧鑳?  var anySkill=available.find(function(s){return s.skill.type==='damage'});
  if(anySkill)return anySkill;
  return available.length>0?available[0]:null;
}

// ==================== 鍏ㄥ眬鎴樻枟瑙嗚杈呭姪鍑芥暟 ====================
var _battleScene=null;
var G_autoBattle=false;
var G_battleSpeed=1;
var G_currentStageId=1;
var G_battlePaused=false;
var G_battleRunning=false;

// 鎴樻枟缁熻鏁版嵁锛堟寜瑙掕壊瀛樺偍锛?var G_battleStats={};
var G_battleUnitIdCounter=0;

function resetBattleStats(){
  G_battleStats={};
  G_battleUnitIdCounter=0;
  updateBattleStatsBoard();
}

function getUnitKey(unit){
  // 浣跨敤鍗曚綅鐨勫敮涓€ID锛屽鏋滄病鏈夊垯鐢熸垚涓€涓?  if(!unit.battleId){
    G_battleUnitIdCounter++;
    unit.battleId=(unit.isEnemy?'E':'P')+'_'+G_battleUnitIdCounter;
  }
  return unit.battleId;
}

function recordBattleStat(unit,stat,value){
  var key=getUnitKey(unit);
  if(!G_battleStats[key]){
    G_battleStats[key]={
      name:unit.name,
      icon:unit.icon,
      isEnemy:unit.isEnemy,
      battleId:unit.battleId,
      damage:0,heal:0,damageTaken:0,control:0,dodge:0,crit:0
    };
  }
  G_battleStats[key][stat]=(G_battleStats[key][stat]||0)+value;
  updateBattleStatsBoard();
}

function forceEndBattle(){
  if(!G_battleRunning){
    // 涓嶅湪鎴樻枟涓紝鐩存帴杩斿洖鍏冲崱閫夋嫨
    hideBattlePanel();
    switchTab('battle');
    return;
  }
  // 鎴樻枟涓紝闇€瑕佺‘璁?  var confirmed=confirm('纭畾瑕佺粨鏉熸垬鏂楀悧锛焅n杩欏皢瑙嗕负鎴樻枟澶辫触銆?);
  if(confirmed){
    G_battleRunning=false;
    G_battlePaused=false;
    G_autoBattle=false;
    showToast('鎴樻枟宸茬粨鏉?);
    hideBattlePanel();
    switchTab('battle');
  }
  // 鐐瑰嚮鍙栨秷鏃朵笉鍋氫换浣曟搷浣?}

function updateBattleStatsBoard(){
  // 璁＄畻缁熻鏁版嵁锛堜笉鍒嗛潰鏉跨被鍨嬶級
  var allyStats=[];
  var enemyStats=[];
  
  for(var key in G_battleStats){
    var stat=G_battleStats[key];
    if(stat.isEnemy){
      enemyStats.push(stat);
    }else{
      allyStats.push(stat);
    }
  }
  
  // 鎸夎緭鍑烘帓搴?  allyStats.sort(function(a,b){return b.damage-a.damage;});
  enemyStats.sort(function(a,b){return b.damage-a.damage;});
  
  function renderStatRow(stat){
    var idNum=stat.battleId?stat.battleId.split('_')[1]:'';
    var displayName=stat.name+(idNum?' <span style="color:#888;font-size:9px">#'+idNum+'</span>':'');
    return '<div style="padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.1)">'
      +'<div style="display:flex;align-items:center;gap:4px;margin-bottom:2px">'
      +'<span style="font-size:14px">'+stat.icon+'</span>'
      +'<span style="flex:1;font-weight:bold;font-size:11px">'+displayName+'</span>'
      +'</div>'
      +'<div style="display:flex;gap:4px;flex-wrap:wrap;font-size:10px">'
      +'<span style="color:#ff6b6b">鈿旓笍'+stat.damage+'</span>'
      +'<span style="color:#2ed573">馃挌'+stat.heal+'</span>'
      +'<span style="color:#ffa502">馃洝锔?+stat.damageTaken+'</span>'
      +'<span style="color:#a55eea">馃幆'+stat.control+'</span>'
      +'<span style="color:#70a1ff">馃挩'+stat.dodge+'</span>'
      +'<span style="color:#ff4757">馃挜'+stat.crit+'</span>'
      +'</div>'
      +'</div>';
  }
  
  function renderToPanel(allyEl,enemyEl){
    if(!allyEl||!enemyEl)return;
    allyEl.innerHTML=allyStats.length>0?allyStats.map(renderStatRow).join(''):'<div class="text-dim">鏆傛棤鏁版嵁</div>';
    enemyEl.innerHTML=enemyStats.length>0?enemyStats.map(renderStatRow).join(''):'<div class="text-dim">鏆傛棤鏁版嵁</div>';
  }
  
  // 鏇存柊鏅€氭垬鏂楅潰鏉?  renderToPanel(
    document.getElementById('ally-stats'),
    document.getElementById('enemy-stats')
  );
  
  // 鏇存柊绔炴妧鍦烘垬鏂楅潰鏉?  renderToPanel(
    document.getElementById('arena-ally-stats'),
    document.getElementById('arena-enemy-stats')
  );
}

function toggleBattlePause(){
  G_battlePaused=!G_battlePaused;
  showToast(G_battlePaused?'鈴革笍 鎴樻枟宸叉殏鍋?:'鈻讹笍 鎴樻枟缁х画');
  updatePauseButton();
}

function updatePauseButton(){
  var btn=document.getElementById('battle-pause-btn');
  if(btn){
    btn.textContent=G_battlePaused?'鈻讹笍 缁х画':'鈴革笍 鏆傚仠';
    btn.className='btn btn-sm '+(G_battlePaused?'btn-primary':'');
  }
}
function getUnitEl(unit){var uid=unit.name+'-'+unit.icon;return document.querySelector('[data-battle-uid="'+uid+'"]')}
function showFloat(unit,text,cls){var el=getUnitEl(unit);if(!el)return;var num=document.createElement('div');num.className='float-num '+(cls||'');num.textContent=text;el.appendChild(num);setTimeout(function(){if(num.parentNode)num.parentNode.removeChild(num)},1100)}
function showSkillEffect(skillIcon,skillName,elementClass){if(!_battleScene)return;var overlay=document.createElement('div');overlay.className='skill-effect-overlay '+(elementClass||'');overlay.innerHTML='<div class="skill-effect-text">'+skillIcon+' '+skillName+'</div>';_battleScene.appendChild(overlay);setTimeout(function(){if(overlay.parentNode)overlay.parentNode.removeChild(overlay)},900)}
function animUnit(unit,cls,duration){var el=getUnitEl(unit);if(!el)return;el.classList.add(cls);setTimeout(function(){el.classList.remove(cls)},duration||400)}
function highlightUnit(unit){document.querySelectorAll('.battle-unit.acting').forEach(function(el){el.classList.remove('acting')});var el=getUnitEl(unit);if(el)el.classList.add('acting')}
function clearHighlight(){document.querySelectorAll('.battle-unit.acting').forEach(function(el){el.classList.remove('acting')})}
function stopAutoBattle(){
  G_autoBattle=false;
  G_battleRunning=false;
  G_battlePaused=false;
}

function setBattleSpeed(spd){
  G_battleSpeed=spd;
  showToast('鎴樻枟鍊嶉€? x'+spd);
  // 鏇存柊鍥哄畾鎴樻枟闈㈡澘涓殑鍊嶉€熸寜閽牱寮?  var speeds=[1,2,4,8];
  speeds.forEach(function(s){
    var btn=document.getElementById('speed-'+s);
    if(btn){
      if(s===spd){
        btn.classList.add('btn-primary');
      }else{
        btn.classList.remove('btn-primary');
      }
    }
  });
}

async function runBattle(stageId){
  // 濡傛灉鎴樻枟宸插湪杩愯锛屼笉閲嶅鍚姩
  if(G_battleRunning){return;}
  G_battleRunning=true;
  G_battlePaused=false;
  updatePauseButton();
  
  const stage=getStage(stageId);
  if(!stage){G_battleRunning=false;return;}
  const teamHeroes=G.team.filter(h=>h!==null);
  if(teamHeroes.length===0){showToast('璇峰厛缂栭槦锛?);G_battleRunning=false;return;}

  let playerUnits=teamHeroes.map(h=>createBattleUnit(h,false));
  let enemyUnits=stage.enemies.map(e=>{
    const tpl=HERO_TEMPLATES.find(t=>t.name===e.name)||HERO_TEMPLATES.find(t=>t.role===e.role&&t.quality===e.quality);
    const fakeHero=tpl?{...createHero(tpl.id,e.level),name:e.name,icon:e.icon,skills:e.skills,bonusSkills:[]}
      :{name:e.name,icon:e.icon,role:e.role,quality:e.quality,level:e.level,skills:e.skills,bonusSkills:[],
        maxHP:calcStat(ROLES[e.role]?ROLES[e.role].baseHP:100,QUALITY_MULT[e.quality]||1,e.level),
        atk:calcStat(ROLES[e.role]?ROLES[e.role].baseATK:15,QUALITY_MULT[e.quality]||1,e.level),
        def:calcStat(ROLES[e.role]?ROLES[e.role].baseDEF:10,QUALITY_MULT[e.quality]||1,e.level),
        spd:calcStat(ROLES[e.role]?ROLES[e.role].baseSPD:10,QUALITY_MULT[e.quality]||1,e.level),
        maxMP:calcStat(ROLES[e.role]?ROLES[e.role].baseMP:40,QUALITY_MULT[e.quality]||1,e.level),
        hp:0,mp:0,equipment:{weapon:null,armor:null,accessory:null}};
    fakeHero.hp=fakeHero.maxHP;fakeHero.mp=fakeHero.maxMP;
    return createBattleUnit(fakeHero,true);
  });
  let allUnits=[...playerUnits,...enemyUnits];
  
  // 鍒濆鍖栨垬鏂楃粺璁℃暟鎹?  resetBattleStats();

  // 鏄剧ず鎴樻枟闈㈡澘锛屽垏鎹㈠埌鎴樻枟椤?  currentTab='battle';
  document.querySelectorAll('.nav-btn').forEach(b=>{
    b.classList.toggle('active',b.dataset.tab==='battle');
  });
  var battlePanel=document.getElementById('battle-panel');
  if(!battlePanel){showToast('鎴樻枟闈㈡澘鍔犺浇澶辫触');G_battleRunning=false;return;}
  battlePanel.style.display='';
  document.getElementById('content').style.display='none';
  const logEl=document.getElementById('battle-log');
  const playerTeamEl=document.getElementById('player-team');
  const enemyTeamEl=document.getElementById('enemy-team');
  const battleInfoEl=document.getElementById('battle-info');
  const battleScene=document.getElementById('battle-scene');
  if(!logEl||!playerTeamEl||!enemyTeamEl||!battleInfoEl||!battleScene){showToast('鎴樻枟鍏冪礌鍔犺浇澶辫触');G_battleRunning=false;return;}
  _battleScene=battleScene;
  var pbbRound=0;
  const roundBadge=document.getElementById('battle-round-badge');
  logEl.innerHTML='';
  battleInfoEl.innerHTML=`<div class="log-title">鈿旓笍 绗?{stage.id}绔狅細${stage.name}</div><div class="text-dim text-sm">${stage.desc}</div>`;

  function log(msg,cls){
    cls=cls||'info';
    var line=document.createElement('div');
    line.className='log-line log-'+cls;
    line.textContent=msg;
    logEl.appendChild(line);
    logEl.scrollTop=logEl.scrollHeight;
  }

  function renderTeams(){
    playerTeamEl.innerHTML=playerUnits.map(u=>{
      const hpPct=Math.max(0,(u.hp/u.maxHP)*100);
      const mpPct=Math.max(0,(u.mp/u.maxMP)*100);
      const shieldPct=u.maxHP>0?Math.min(100,(u.shield/u.maxHP)*100):0;
      const isLow=hpPct<30;
      const roleIcon=ROLES[u.hero.role]?ROLES[u.hero.role].icon:'鈿旓笍';
      const buffsHTML=u.buffs.map(b=>{
        const isPos=b.mult>1||b.stat==='taunt'||b.stat==='dodge'||b.stat==='reflect'||b.stat==='stun';
        return '<span class="buff-tag '+(isPos?'buff-positive':'buff-negative')+'">'+(b.name||b.stat)+(b.duration>0?'('+b.duration+')':'')+'</span>';
      }).join('');
      const dotsHTML=u.dot.map(d=>'<span class="buff-tag buff-dot">'+d.name+'('+d.duration+')</span>').join('');
      return '<div class="battle-unit ally-unit '+(u.alive?'':'dead')+'" data-battle-uid="'+u.name+'-'+u.icon+'">'
        +'<div class="unit-avatar-wrap">'
        +'<div class="unit-role-icon">'+roleIcon+'</div>'
        +'<div class="unit-avatar quality-'+u.hero.quality+'">'+u.icon+'</div>'
        +'<div class="unit-level">'+u.hero.level+'</div>'
        +'</div>'
        +'<div class="unit-name">'+u.name+'</div>'
        +'<div class="unit-bars">'
        +'<div class="unit-bar"><span class="unit-bar-label">HP</span><div class="unit-bar-track"><div class="unit-bar-fill hp '+(isLow?'low':'')+'" style="width:'+hpPct+'%"></div></div><span class="unit-bar-val">'+Math.max(0,u.hp)+'/'+u.maxHP+'</span></div>'
        +'<div class="unit-bar"><span class="unit-bar-label">MP</span><div class="unit-bar-track"><div class="unit-bar-fill mp" style="width:'+mpPct+'%"></div></div><span class="unit-bar-val">'+u.mp+'/'+u.maxMP+'</span></div>'
        +(u.shield>0?'<div class="unit-bar unit-shield-bar"><span class="unit-bar-label" style="color:#54a0ff">馃洝</span><div class="unit-bar-track"><div class="unit-bar-fill shield-bar" style="width:'+shieldPct+'%"></div></div><span class="unit-bar-val" style="color:#54a0ff">'+u.shield+'</span></div>':'')
        +'</div>'
        +'<div class="unit-buffs">'+buffsHTML+dotsHTML+'</div>'
        +'</div>';
    }).join('');
    enemyTeamEl.innerHTML=enemyUnits.map(u=>{
      const hpPct=Math.max(0,(u.hp/u.maxHP)*100);
      const shieldPct=u.maxHP>0?Math.min(100,(u.shield/u.maxHP)*100):0;
      const isLow=hpPct<30;
      const roleIcon=ROLES[u.hero.role]?ROLES[u.hero.role].icon:'鈿旓笍';
      const buffsHTML=u.buffs.map(b=>{
        const isPos=b.mult>1||b.stat==='taunt'||b.stat==='dodge'||b.stat==='reflect'||b.stat==='stun';
        return '<span class="buff-tag '+(isPos?'buff-positive':'buff-negative')+'">'+(b.name||b.stat)+(b.duration>0?'('+b.duration+')':'')+'</span>';
      }).join('');
      const dotsHTML=u.dot.map(d=>'<span class="buff-tag buff-dot">'+d.name+'('+d.duration+')</span>').join('');
      return '<div class="battle-unit enemy-unit '+(u.alive?'':'dead')+'" data-battle-uid="'+u.name+'-'+u.icon+'">'
        +'<div class="unit-avatar-wrap">'
        +'<div class="unit-role-icon">'+roleIcon+'</div>'
        +'<div class="unit-avatar quality-'+u.hero.quality+'">'+u.icon+'</div>'
        +'<div class="unit-level">'+u.hero.level+'</div>'
        +'</div>'
        +'<div class="unit-name">'+u.name+'</div>'
        +'<div class="unit-bars">'
        +'<div class="unit-bar"><span class="unit-bar-label">HP</span><div class="unit-bar-track"><div class="unit-bar-fill hp '+(isLow?'low':'')+'" style="width:'+hpPct+'%"></div></div><span class="unit-bar-val">'+Math.max(0,u.hp)+'/'+u.maxHP+'</span></div>'
        +(u.shield>0?'<div class="unit-bar unit-shield-bar"><span class="unit-bar-label" style="color:#54a0ff">馃洝</span><div class="unit-bar-track"><div class="unit-bar-fill shield-bar" style="width:'+shieldPct+'%"></div></div><span class="unit-bar-val" style="color:#54a0ff">'+u.shield+'</span></div>':'')
        +'</div>'
        +'<div class="unit-buffs">'+buffsHTML+dotsHTML+'</div>'
        +'</div>';
    }).join('');
  }

  renderTeams();
  log('鈿旓笍 鎴樻枟寮€濮嬶紒','title');
  await sleep(600);

  let round=0;
  const maxRounds=30;

  while(round<maxRounds){
    round++;
    pbbRound=round;
    roundBadge.textContent='鍥炲悎 '+round;
    log('鈥斺€?绗?'+round+' 鍥炲悎 鈥斺€?,'title');
    await sleep(300);

    allUnits.filter(u=>u.alive).forEach(u=>{
      // 娌绘剤鑰咃細鐢熷懡閾炬帴 - 姣忓洖鍚堣嚜鍔ㄦ仮澶?%鐢熷懡鍊?      if(u.role==='healer' && !u.isEnemy){
        const regen=Math.floor(u.maxHP*0.05);
        u.hp=Math.min(u.maxHP,u.hp+regen);
        showFloat(u,'+'+regen+' 鐢熷懡鎭㈠','heal');
      }
      
      u.dot=u.dot.filter(d=>{
        // 鏈＋锛欴OT浼ゅ+50%
        let dotDmg=d.dmg;
        if(d.sourceRole==='warlock'){
          dotDmg=Math.floor(dotDmg*1.5);
        }
        u.hp=Math.max(0,u.hp-dotDmg);
        log(u.icon+u.name+' 鍙楀埌 '+d.name+'锛屾崯澶?'+dotDmg+' 鐢熷懡','debuff');
        showFloat(u,'-'+dotDmg+' '+d.name,'damage');
        animUnit(u,'hit',300);
        // 璁板綍DOT鎵夸激
        recordBattleStat(u,'damageTaken',dotDmg);
        
        // 鍦ｉ獞澹細鍦ｅ厜搴囨姢 - 鍙楀埌鑷村懡浼ゅ鏃朵繚鐣?鐐圭敓鍛?        if(u.hp<=0 && u.role==='paladin' && !u.isEnemy && !u.deathDefyUsed){
          u.hp=1;
          u.deathDefyUsed=true;
          log(u.icon+' '+u.name+' 瑙﹀彂鍦ｅ厜搴囨姢锛屼繚鐣?鐐圭敓鍛斤紒','heal');
          showFloat(u,'鍦ｅ厜搴囨姢锛?,'heal');
        }else if(u.hp<=0){
          u.alive=false;
          log(u.icon+' '+u.name+' 鍊掍笅浜?..','death');
          animUnit(u,'dying',700);
        }
        d.duration--;
        return d.duration>0;
      });
      u.buffs=u.buffs.filter(b=>{b.duration--;return b.duration>0});
    });
    renderTeams();
    await sleep(200);

    if(!playerUnits.some(u=>u.alive)){log('馃拃 鎴樻枟澶辫触...闃熶紞鍏ㄥ啗瑕嗘病銆?,'death');break}
    if(!enemyUnits.some(u=>u.alive)){log('馃帀 鎴樻枟鑳滃埄锛?,'title');break}

    const acting=[...allUnits.filter(u=>u.alive)].sort((a,b)=>b.spd-a.spd);

    for(const unit of acting){
      if(!unit.alive)continue;
      highlightUnit(unit);
      await sleep(200);

      if(unit.buffs.some(b=>b.stat==='stun')){
        log(unit.icon+' '+unit.name+' 澶勪簬鐪╂檿鐘舵€侊紝鏃犳硶琛屽姩','info');
        showFloat(unit,'鐪╂檿!','debuff-text');
        await sleep(300);
        clearHighlight();
        continue;
      }

      const allSkillIds=[...unit.hero.skills,...unit.bonusSkills];
      let chosenSkill=null;
      let skillId=null;

      // 鏅鸿兘AI閫夋嫨鎶€鑳?      const smartChoice=smartChooseSkill(unit,allUnits);
      if(smartChoice){
        skillId=smartChoice.id;
        chosenSkill=smartChoice.skill;
      }

      if(chosenSkill){
        // 閲戞墜鎸囷細鏃犻檺钃?        if(!(G_cheats.enabled && G_cheats.infiniteMP && !unit.isEnemy)){
          unit.mp-=chosenSkill.mpCost;
        }
        unit.cooldowns[skillId]=chosenSkill.cooldown;

        let effectClass='fire';
        if(chosenSkill.name.indexOf('鍐?)>=0||chosenSkill.name.indexOf('鏆撮闆?)>=0)effectClass='ice';
        else if(chosenSkill.name.indexOf('鏆?)>=0||chosenSkill.name.indexOf('璇呭拻')>=0||chosenSkill.name.indexOf('鐏甸瓊')>=0)effectClass='dark';
        else if(chosenSkill.name.indexOf('鍦?)>=0||chosenSkill.name.indexOf('鍏?)>=0||chosenSkill.name.indexOf('鍑€鍖?)>=0)effectClass='holy';
        else if(chosenSkill.name.indexOf('姣?)>=0)effectClass='poison';
        else if(chosenSkill.type==='heal'||chosenSkill.type==='cleanse')effectClass='heal-effect';
        else if(chosenSkill.type==='shield')effectClass='shield-effect';

        showSkillEffect(chosenSkill.icon,chosenSkill.name,effectClass);
        showFloat(unit,chosenSkill.icon+chosenSkill.name,'skill-name');
        await sleep(400);

        const target=getValidTarget(unit,allUnits,chosenSkill.target);
        if(target){
          await executeSkillV2(unit,target,chosenSkill,allUnits,log);
          await sleep(300);
        }
      }else{
        const target=getValidTarget(unit,allUnits,'single_enemy');
        if(target){
          const r=calcDamage(unit,target,null);
          if(r.dodged){
            log(unit.icon+' '+unit.name+' 鏀诲嚮 '+target.icon+target.name+'锛屼絾琚棯閬夸簡锛?,'info');
            showFloat(target,'闂伩!','dodge');
            recordBattleStat(target,'dodge',1);
          }else{
            let dmg=r.dmg;
            const reflectBuff=target.buffs.find(b=>b.stat==='reflect');
            if(reflectBuff){
              const reflectDmg=Math.floor(dmg*reflectBuff.mult);
              unit.hp=Math.max(0,unit.hp-reflectDmg);
              log(target.icon+target.name+' 鍙嶅脊浜?'+reflectDmg+' 鐐逛激瀹筹紒','damage');
              showFloat(unit,'-'+reflectDmg+' 鍙嶅脊','damage');
              animUnit(unit,'hit',300);
              if(unit.hp<=0){unit.alive=false;log(unit.icon+' '+unit.name+' 鍊掍笅浜?..','death');animUnit(unit,'dying',700)}
            }
            if(target.shield>0){const absorbed=Math.min(target.shield,dmg);target.shield-=absorbed;dmg-=absorbed;if(absorbed>0)showFloat(target,'馃洝-'+absorbed,'shield-num')}
            target.hp=Math.max(0,target.hp-dmg);
            log(unit.icon+' '+unit.name+' 鏀诲嚮 '+target.icon+target.name+'锛岄€犳垚 '+dmg+' 鐐逛激瀹?+(r.crit?' 馃挜鏆村嚮锛?:''),r.crit?'crit':'damage');
            showFloat(target,(r.crit?'馃挜':'')+dmg,r.crit?'crit':'damage');
            animUnit(target,'hit',300);
            // 璁板綍缁熻鏁版嵁
            recordBattleStat(unit,'damage',dmg);
            recordBattleStat(target,'damageTaken',dmg);
            if(r.crit)recordBattleStat(unit,'crit',1);
            if(target.hp<=0){target.alive=false;log(target.icon+' '+target.name+' 鍊掍笅浜?..','death');animUnit(target,'dying',700)}
          }
          updateBattleStatsBoard();
        }
      }

      for(let sid in unit.cooldowns){unit.cooldowns[sid]--}
      clearHighlight();
      renderTeams();
      await sleep(250);

      if(!playerUnits.some(u=>u.alive)){break}
      if(!enemyUnits.some(u=>u.alive)){break}
    }

    renderTeams();
    if(!playerUnits.some(u=>u.alive)){log('馃拃 鎴樻枟澶辫触...闃熶紞鍏ㄥ啗瑕嗘病銆?,'death');break}
    if(!enemyUnits.some(u=>u.alive)){log('馃帀 鎴樻枟鑳滃埄锛?,'title');break}

    allUnits.filter(u=>u.alive).forEach(u=>{u.mp=Math.min(u.maxMP,u.mp+Math.floor(u.maxMP*0.05))});
  }

  if(round>=maxRounds){log('鈴?鍥炲悎鐢ㄥ敖锛屾垬鏂楀钩灞€銆?,'info')}

  const won=enemyUnits.every(u=>!u.alive);
  if(won){
    const rw=stage.rewards;
    // 濂栧姳鍙楄祫婧愪笂闄愮害鏉?    G.resources.gold=Math.min((G.resources.gold||0)+(rw.gold||0), RESOURCE_LIMITS.gold);
    G.resources.stone=Math.min((G.resources.stone||0)+(rw.stone||0), RESOURCE_LIMITS.stone);
    G.resources.gems=Math.min((G.resources.gems||0)+(rw.gems||0), RESOURCE_LIMITS.gems);
    // 鍏朵粬璧勬簮濂栧姳
    G.resources.iron=Math.min((G.resources.iron||0)+(rw.iron||Math.floor((rw.stone||0)*0.3)), RESOURCE_LIMITS.iron);
    G.resources.food=Math.min((G.resources.food||0)+(rw.food||Math.floor((rw.gold||0)*0.1)), RESOURCE_LIMITS.food);
    G.resources.fame=Math.min((G.resources.fame||0)+(rw.fame||Math.floor((rw.gold||0)/100)), RESOURCE_LIMITS.fame);
    if(stage.id>=G.stageProgress){G.stageProgress=stage.id+1}
    G_currentStageId=stage.id+1;
    teamHeroes.forEach(h=>addHeroExp(h,rw.exp||0));
    let drop=null;
    if(Math.random()<0.3+stage.id*0.05){
      const possibleDrops=EQUIP_TEMPLATES.filter(e=>QUALITIES.indexOf(e.quality)<=Math.min(stage.id,4));
      if(possibleDrops.length>0){
        const tpl=pick(possibleDrops);
        drop={uid:++G.heroIdCounter,id:tpl.id,heroUid:null};
        G.equipment.push(drop);
      }
    }
    log('\n馃摝 鎴樺埄鍝侊細馃挵'+(rw.gold||0)+' 猸?+(rw.exp||0)+' 馃'+(rw.stone||0)+' 鉀忥笍'+(rw.iron||0)+' 馃尶'+(rw.herbs||0)+(rw.gems?' 馃拵'+rw.gems:'')+(drop?' 馃巵'+EQUIP_TEMPLATES.find(t=>t.id===drop.id).name:''),'title');
    showToast('鎴樻枟鑳滃埄锛佽幏寰?'+rw.gold+' 閲戝竵');
  }else{
    showToast('鎴樻枟澶辫触...');
  }

  updateResUI();
  renderTeams();
  saveGame();
  G_battleRunning=false;
  G_battlePaused=false;
  updatePauseButton();
  
  var btnArea=document.getElementById('battle-buttons');
  if(btnArea){
    if(G_autoBattle&&won){
      btnArea.innerHTML='<span class="text-gold text-sm">鉁?鑳滃埄锛佽嚜鍔ㄨ繘鍏ヤ笅涓€鍏?..</span>';
      renderCurrentTab();
      setTimeout(function(){startBattle(G_currentStageId)},1500/G_battleSpeed);
    }else{
      G_autoBattle=false;
      // 闈炶嚜鍔ㄦ垬鏂楋細娓呯┖鎸夐挳鍖哄煙锛屼娇鐢ㄩ《閮ㄧ殑"缁撴潫鎴樻枟"鎸夐挳
      btnArea.innerHTML='';
    }
  }
}

async function executeSkillV2(user,target,skill,allUnits,logFn){
  const targets=Array.isArray(target)?target:[target];
  var userSide=user.isEnemy?'enemy':'ally';
  switch(skill.type){
    case 'damage':
      targets.forEach(t=>{
        if(!t.alive)return;
        const r=calcDamage(user,t,skill);
        if(r.dodged){
          logFn(user.icon+' '+user.name+' 浣跨敤 '+skill.icon+skill.name+'锛屼絾 '+t.icon+t.name+' 闂伩浜嗭紒','info');
          showFloat(t,'闂伩!','dodge');
          recordBattleStat(t,'dodge',1);
          return;
        }
        let dmg=r.dmg;
        if(t.shield>0){const absorbed=Math.min(t.shield,dmg);t.shield-=absorbed;dmg-=absorbed;if(absorbed>0)showFloat(t,'馃洝-'+absorbed,'shield-num')}
        t.hp=Math.max(0,t.hp-dmg);
        logFn(user.icon+' '+user.name+' 浣跨敤 '+skill.icon+skill.name+' 瀵?'+t.icon+t.name+' 閫犳垚 '+dmg+' 鐐逛激瀹?+(r.crit?' 馃挜鏆村嚮锛?:''),r.crit?'crit':'damage');
        showFloat(t,(r.crit?'馃挜':'')+dmg,r.crit?'crit':'damage');
        animUnit(t,'hit',300);
        // 璁板綍缁熻鏁版嵁
        recordBattleStat(user,'damage',dmg);
        recordBattleStat(t,'damageTaken',dmg);
        if(r.crit)recordBattleStat(user,'crit',1);
        if(skill.stunChance&&Math.random()<skill.stunChance){
          t.buffs.push({stat:'stun',duration:1,name:'鐪╂檿'});
          logFn(t.icon+t.name+' 琚湬鏅曚簡锛?,'debuff');
          showFloat(t,'鐪╂檿!','debuff-text');
          recordBattleStat(user,'control',1);
        }
        if(skill.dot){t.dot.push({dmg:Math.floor(user.atk*skill.dot.dmgPct),duration:skill.dot.duration,name:'涓瘨',sourceRole:user.role});logFn(t.icon+t.name+' 琚柦鍔犱簡 '+skill.dot.name+'锛?,'debuff');showFloat(t,'鈽犱腑姣?,'debuff-text')}
        if(skill.debuff){const db=skill.debuff;if(db.stat==='all'){t.buffs.push({stat:'atk',mult:db.mult,duration:db.duration,name:'璇呭拻-鏀?});t.buffs.push({stat:'def',mult:db.mult,duration:db.duration,name:'璇呭拻-闃?})}else{t.buffs.push({stat:db.stat,mult:db.mult,duration:db.duration,name:'鍓婂急'})}logFn(t.icon+t.name+' 琚墛寮变簡锛?,'debuff');showFloat(t,'鈻煎墛寮?,'debuff-text')}
        if(t.hp<=0){t.alive=false;logFn(t.icon+' '+t.name+' 鍊掍笅浜?..','death');animUnit(t,'dying',700)}
      });
      updateBattleStatsBoard();
      break;
    case 'heal':
      var totalHeal=0;
      targets.forEach(t=>{
        if(!t.alive)return;
        const heal=Math.floor(t.maxHP*skill.healPct);
        t.hp=Math.min(t.maxHP,t.hp+heal);
        logFn(user.icon+' '+user.name+' 浣跨敤 '+skill.icon+skill.name+'锛屾仮澶?'+t.icon+t.name+' '+heal+' 鐐圭敓鍛?,'heal');
        showFloat(t,'+'+heal,'heal');animUnit(t,'heal-target',500);
        totalHeal+=heal;
      });
      // 璁板綍鏂芥硶鑰呯殑娌荤枟杈撳嚭閲忥紙娌荤枟鑷繁鎴栧埆浜虹殑鎬婚噺锛?      if(totalHeal>0)recordBattleStat(user,'heal',totalHeal);
      updateBattleStatsBoard();
      break;
    case 'buff':
      targets.forEach(t=>{
        if(!t.alive)return;
        t.buffs.push({...skill.buff,name:skill.name});
        logFn(user.icon+' '+user.name+' 浣跨敤 '+skill.icon+skill.name+'锛?+(t===user?'鑷韩':'闃熷弸')+'鑾峰緱澧炵泭鏁堟灉','buff');
        showFloat(t,'鈫?+skill.name,'buff-text');animUnit(t,'heal-target',500);
      });break;
    case 'shield':
      targets.forEach(t=>{
        if(!t.alive)return;
        const amt=Math.floor(t.maxHP*skill.shieldPct);
        t.shield+=amt;
        logFn(user.icon+' '+user.name+' 浣跨敤 '+skill.icon+skill.name+'锛屼负 '+t.icon+t.name+' 娣诲姞 '+amt+' 鐐规姢鐩?,'buff');
        showFloat(t,'馃洝+'+amt,'shield-num');animUnit(t,'shield-up',400);
      });break;
    case 'drain':
      targets.forEach(t=>{
        if(!t.alive)return;
        const r=calcDamage(user,t,skill);
        if(r.dodged){logFn(user.icon+' '+user.name+' 浣跨敤 '+skill.icon+skill.name+'锛屼絾 '+t.icon+t.name+' 闂伩浜嗭紒','info');showFloat(t,'闂伩!','dodge');return}
        let dmg=r.dmg;
        if(t.shield>0){const absorbed=Math.min(t.shield,dmg);t.shield-=absorbed;dmg-=absorbed}
        t.hp=Math.max(0,t.hp-dmg);
        const healAmt=Math.floor(dmg*0.5);
        user.hp=Math.min(user.maxHP,user.hp+healAmt);
        logFn(user.icon+' '+user.name+' 浣跨敤 '+skill.icon+skill.name+'锛屽 '+t.icon+t.name+' 閫犳垚 '+dmg+' 浼ゅ锛屾仮澶?'+healAmt+' 鐢熷懡','skill');
        showFloat(t,'-'+dmg,'damage');animUnit(t,'hit',300);
        showFloat(user,'+'+healAmt,'heal');animUnit(user,'heal-target',500);
        if(t.hp<=0){t.alive=false;logFn(t.icon+' '+t.name+' 鍊掍笅浜?..','death');animUnit(t,'dying',700)}
      });break;
    case 'debuff':
      targets.forEach(t=>{
        if(!t.alive)return;
        const db=skill.debuff;
        if(db.stat==='all'){t.buffs.push({stat:'atk',mult:db.mult,duration:db.duration,name:'璇呭拻-鏀?});t.buffs.push({stat:'def',mult:db.mult,duration:db.duration,name:'璇呭拻-闃?})}else{t.buffs.push({stat:db.stat,mult:db.mult,duration:db.duration,name:'璇呭拻'})}
        logFn(user.icon+' '+user.name+' 浣跨敤 '+skill.icon+skill.name+'锛?+t.icon+t.name+' 琚瘏鍜掍簡锛?,'debuff');
        showFloat(t,'鈻?+skill.name,'debuff-text');
      });break;
    case 'cleanse':
      targets.forEach(t=>{
        if(!t.alive)return;
        const negCount=t.buffs.filter(b=>b.stat==='stun'||(b.stat==='atk'&&b.mult<1)||(b.stat==='def'&&b.mult<1)).length;
        t.buffs=t.buffs.filter(b=>!(b.stat==='stun'||(b.stat==='atk'&&b.mult<1)||(b.stat==='def'&&b.mult<1)));
        t.dot=[];
        logFn(user.icon+' '+user.name+' 浣跨敤 '+skill.icon+skill.name+'锛屾竻闄や簡 '+t.icon+t.name+' 鐨?'+negCount+' 涓礋闈㈡晥鏋?,'heal');
        showFloat(t,'鉁ㄥ噣鍖?,'buff-text');animUnit(t,'heal-target',500);
      });break;
  }
}

function sleep(ms){
  return new Promise(function(r){
    var checkPause=function(){
      if(G_battlePaused){
        setTimeout(checkPause,100);
      }else{
        setTimeout(r,Math.max(20,ms/G_battleSpeed));
      }
    };
    checkPause();
  });
}

// ==================== 鍚堟垚绯荤粺 ====================
function findMergeRecipe(heroUids){
  if(heroUids.length<2)return null;
  const heroes=heroUids.map(uid=>G.heroes.find(h=>h.uid===uid)).filter(Boolean);
  if(heroes.length<2)return null;
  return{recipe:{result:'__dynamic__',inheritSkills:true,lore:'鑻遍泟鐨勮瀺鍚堝垱閫犱簡鏂扮殑瀛樺湪銆?},usedHeroes:heroes};
}

// 寮傚彉姒傜巼閰嶇疆
var G_MUTATION_RATE = 0.30;       // 30% 寮傚彉姒傜巼
var G_QUALITY_UP_RATE = 0.05;      // 5% 鍝佽川+1姒傜巼
var G_MYTHIC_DIRECT_RATE = 0.01;   // 1% 鐩存帴绁炶瘽姒傜巼

function generateFusedHero(heroes){
  // 鍩轰簬杈撳叆鑻遍泟灞炴€у嵆鏃剁敓鎴愭柊鑻遍泟
  var inputIds=heroes.map(function(h){return h.id}).sort().join('+');
  var hash=hashStr(inputIds);
  
  // 1. 纭畾鏂板搧璐細涓嶈兘瓒呰繃琚瀺鍚堟渶楂樺搧璐?  var qualities=heroes.map(function(h){return QUALITIES.indexOf(h.quality)});
  var maxQ=Math.max.apply(null,qualities);
  var avgQ=Math.floor(qualities.reduce(function(s,v){return s+v},0)/qualities.length);
  // 鏂板搧璐?= 骞冲潎鍝佽川锛屼絾涓嶈兘瓒呰繃鏈€楂樺搧璐?  var newQIdx=Math.min(maxQ,avgQ);
  var newQuality=QUALITIES[newQIdx];
  
  // 2. 鍒ゅ畾鐗规畩缁撴灉锛堜紭鍏堢骇锛氱璇?> 鍝佽川+1 > 寮傚彉 > 鏅€氾級
  // 閲戞墜鎸囧己鍒跺紓鍙?  var isMutation=G_cheats.forceMutation||Math.random()<G_MUTATION_RATE;
  
  // 1% 鐩存帴绁炶瘽锛堟渶楂樹紭鍏堢骇锛屾棤瑙嗗綋鍓嶅搧璐級
  var isDirectMythic=Math.random()<G_MYTHIC_DIRECT_RATE;
  if(isDirectMythic){
    newQuality='mythic';
    newQIdx=QUALITIES.indexOf('mythic');
    isMutation=true; // 绁炶瘽蹇呭畾寮傚彉
  }
  // 5% 鍝佽川+1锛堜笉瓒呰繃绁炶瘽锛?  else if(Math.random()<G_QUALITY_UP_RATE && newQIdx<QUALITIES.length-1){
    newQIdx++;
    newQuality=QUALITIES[newQIdx];
    isMutation=true; // 鍝佽川鎻愬崌蹇呭畾寮傚彉
  }
  
  // 3. 纭畾鏂拌亴涓氾細鍩轰簬鍝堝笇浠庤緭鍏ヨ嫳闆勮亴涓氫腑閫?  var allRoles=heroes.map(function(h){return h.role});
  var uniqueRoles=[];
  allRoles.forEach(function(r){if(uniqueRoles.indexOf(r)===-1)uniqueRoles.push(r)});
  var mainRole=uniqueRoles[hash%uniqueRoles.length];
  
  // 4. 纭畾鏂版妧鑳?  var allSkillPool=[];
  heroes.forEach(function(h){
    h.skills.forEach(function(s){if(allSkillPool.indexOf(s)===-1)allSkillPool.push(s)});
    h.bonusSkills.forEach(function(s){if(allSkillPool.indexOf(s)===-1)allSkillPool.push(s)});
  });
  // 鍔犲叆鐩爣瑙掕壊鐨勫熀纭€鎶€鑳?  var roleData=ROLES[mainRole];
  if(roleData&&roleData.skills){
    roleData.skills.forEach(function(s){if(allSkillPool.indexOf(s)===-1)allSkillPool.push(s)});
  }
  // 寮傚彉鑻遍泟棰濆鑾峰緱1-2涓妧鑳?  var baseSkillCount=2+Math.floor(hash%3);
  var skillCount=isMutation?Math.min(allSkillPool.length,baseSkillCount+1+Math.floor(Math.random()*2)):baseSkillCount;
  var shuffled=allSkillPool.slice().sort(function(){return Math.random()-0.5});
  var newSkills=shuffled.slice(0,skillCount);
  
  // 5. 纭畾鏂板睘鎬э細浠庢潗鏂欒嫳闆勪腑闅忔満缁ф壙锛堣€岄潪鍙栨渶楂樺€硷級
  var randIdx=Math.floor(Math.random()*heroes.length);
  var maxHP=heroes[randIdx].maxHP;
  randIdx=Math.floor(Math.random()*heroes.length);
  var atk=heroes[randIdx].atk;
  randIdx=Math.floor(Math.random()*heroes.length);
  var def=heroes[randIdx].def;
  randIdx=Math.floor(Math.random()*heroes.length);
  var spd=heroes[randIdx].spd;
  randIdx=Math.floor(Math.random()*heroes.length);
  var maxMP=heroes[randIdx].maxMP;
  
  // 灞炴€ц绠楋細闈炲紓鍙樻椂淇濇寔缁ф壙鍊硷紝寮傚彉鏃舵彁鍗?  if(isMutation){
    // 寮傚彉锛氬彇鍚屽搧璐ㄥ拰+1鍝佽川涔嬮棿鐨勫€嶇巼
    var qm=QUALITY_MULT[newQuality];
    var nextQm=QUALITIES.indexOf(newQuality)<QUALITIES.length-1?QUALITY_MULT[QUALITIES[QUALITIES.indexOf(newQuality)+1]]:qm;
    var mutMult=1.0+(nextQm/qm-1.0)*0.5; // 鍙栦腑闂村€兼瘮渚?    maxHP=Math.floor(maxHP*mutMult);
    atk=Math.floor(atk*mutMult);
    def=Math.floor(def*mutMult);
    spd=Math.floor(spd*mutMult);
    maxMP=Math.floor(maxMP*mutMult);
  }
  // 闈炲紓鍙橈細淇濇寔缁ф壙鐨勫睘鎬у€间笉鍙?  
  // 6. 鐢熸垚鍚嶇О鍜屽浘鏍?  var namePrefixes={
    warrior:['鎴?,'鐙?,'閾?,'琛€','榫?,'闆?,'鐑?],
    guardian:['鍦?,'纾?,'涓嶇伃','姘告亽','閽㈤搧','鍫″瀿'],
    mage:['濂?,'鏄?,'铏氱┖','娣辨笂','娣锋矊','鍏冪礌'],
    healer:['鍦?,'澶?,'鐢熷懡','鍏夋槑','绁炲湥','鑷劧'],
    assassin:['褰?,'鏆?,'骞?,'骞?,'澶?,'榄?],
    ranger:['椋?,'闆?,'鐤?,'鑻?,'澶?,'鐚?],
    warlock:['鏆?,'铏氱┖','鍣瓊','璇呭拻','鍐?,'娓?],
    paladin:['鍦?,'鍏?,'绁?,'澶╁惎','瀹″垽','榛庢槑']
  };
  var nameSuffixes={
    warrior:['鎴樺＋','鍕囪€?,'鍓戝湥','鎴樼','姝﹀湥','鏂楀＋'],
    guardian:['瀹堝崼','澹佸瀿','瀹堟姢鑰?,'閾佸','鍦ｇ浘','鍫″瀿'],
    mage:['娉曞笀','璐よ€?,'鏈＋','澶ч瓟瀵煎笀','鏄熸湳甯?,'鍏冪礌浣?],
    healer:['绁徃','鍦ｈ€?,'绁炲畼','娌绘剤鑰?,'鐢熷懡浣?,'鍦ｅコ'],
    assassin:['鏉€鎵?,'鏆楀奖','鏀跺壊鑰?,'骞界伒','澶滆鑰?,'褰卞垉'],
    ranger:['娓镐緺','鐚庢墜','寮撳湥','椋庤鑰?,'绁炲皠鎵?,'楣扮溂'],
    warlock:['鏈＋','鍙敜甯?,'鍣瓊鑰?,'鍐ョ帇','铏氱┖浣?,'娣辨笂鑰?],
    paladin:['楠戝＋','鍦ｉ獞','瀹″垽鑰?,'瀹堟姢鑰?,'绁炲崼','澶╅獞']
  };
  var icons={
    warrior:['鈿旓笍','馃棥锔?,'馃獡','馃槫','馃悏','鈿?],
    guardian:['馃洝锔?,'馃彴','馃椏','馃敱','馃П','馃敯'],
    mage:['馃敭','馃専','鉂勶笍','馃敟','馃挜','馃尃'],
    healer:['馃挌','鉁濓笍','馃寛','馃懠','馃尦','馃専'],
    assassin:['馃棥锔?,'馃懁','馃寫','馃懟','鈿帮笍','馃寵'],
    ranger:['馃徆','鉀堬笍','馃尓锔?,'馃幆','馃','馃専'],
    warlock:['馃憗锔?,'馃槇','馃寑','馃└','馃拃','馃寫'],
    paladin:['鉁?,'鈿?,'馃洝锔?,'馃敯','馃専','鈿滐笍']
  };
  var prefixes=namePrefixes[mainRole]||namePrefixes.warrior;
  var suffixes=nameSuffixes[mainRole]||nameSuffixes.warrior;
  var iconList=icons[mainRole]||icons.warrior;
  
  var prefix=prefixes[hash%prefixes.length];
  var suffix=suffixes[(hash>>4)%suffixes.length];
  var icon=iconList[(hash>>8)%iconList.length];
  
  // 寮傚彉鑻遍泟鍚嶇О鍓嶇紑
  var qualityPrefix={common:'',rare:'绮捐嫳',epic:'鍙茶瘲',legendary:'浼犺',mythic:'绁炶瘽'};
  var mutationPrefix=isMutation?'鈽ｏ笍寮傚彉路':'';
  var newName=mutationPrefix+(qualityPrefix[newQuality]||'')+prefix+suffix;
  
  // 7. 缁ф壙鏈€楂樼瓑绾?  var maxLevel=0;
  heroes.forEach(function(h){if(h.level>maxLevel)maxLevel=h.level});
  
  // 8. 鍒涘缓鑻遍泟瀵硅薄
  var newHero={
    uid:++G.heroIdCounter,
    id:'fused_'+hash%100000+(isMutation?'_mut':''),
    name:newName,
    icon:icon,
    role:mainRole,
    quality:newQuality,
    level:maxLevel,
    maxHP:maxHP,
    hp:maxHP,
    atk:atk,
    def:def,
    spd:spd,
    maxMP:maxMP,
    mp:maxMP,
    skills:newSkills,
    bonusSkills:[],
    equipment:{weapon:null,armor:null,accessory:null},
    exp:0,
    lore:isMutation?
      '鈽ｏ笍寮傚彉鑻遍泟锛佺敱'+heroes.map(function(h){return h.name}).join('涓?)+'铻嶅悎鏃跺彂鐢熷紓鍙橈紝鎷ユ湁瓒呰秺鍚屽搧璐ㄧ殑鍔涢噺銆?:
      '鐢?+heroes.map(function(h){return h.name}).join('涓?)+'铻嶅悎璇炵敓鐨?+QUALITY_NAMES[newQuality]+'鑻遍泟銆?,
    deathDefyUsed: false,
    isMutation: isMutation
  };
  
  return newHero;
}

function hashStr(str){
  var hash=5381;
  for(var i=0;i<str.length;i++){
    hash=((hash<<5)+hash)+str.charCodeAt(i);
    hash=hash&0x7fffffff;
  }
  return hash;
}

function executeMerge(heroUids){
  const heroes=heroUids.map(uid=>G.heroes.find(h=>h.uid===uid)).filter(Boolean);
  if(heroes.length<2){showToast('璇疯嚦灏戦€夋嫨2涓嫳闆勶紒');return false}
  
  // 鍗虫椂鐢熸垚铻嶅悎鑻遍泟
  const newHero=generateFusedHero(heroes);
  
  // 绉婚櫎琚瀺鍚堢殑鑻遍泟
  heroes.forEach(h=>{
    const idx=G.heroes.findIndex(x=>x.uid===h.uid);
    if(idx>=0)G.heroes.splice(idx,1);
    // 浠庨槦浼嶄腑绉婚櫎
    for(let i=0;i<G.team.length;i++){
      if(G.team[i]&&G.team[i].uid===h.uid)G.team[i]=null;
    }
  });
  
  // 娣诲姞鏂拌嫳闆?  G.heroes.push(newHero);
  
  showToast('铻嶅悎鎴愬姛锛佽幏寰?'+QUALITY_NAMES[newHero.quality]+' 鑻遍泟锛?+newHero.icon+' '+newHero.name);
  return true;
}

// ==================== 瑁呭绯荤粺 ====================
function createEquipment(templateId){
  const tpl=EQUIP_TEMPLATES.find(t=>t.id===templateId);
  if(!tpl)return null;
  return{uid:++G.heroIdCounter,id:tpl.id,heroUid:null};
}

function equipItem(heroUid,equipUid){
  const hero=G.heroes.find(h=>h.uid===heroUid);
  const equip=G.equipment.find(e=>e.uid===equipUid);
  if(!hero||!equip)return;
  const tpl=EQUIP_TEMPLATES.find(t=>t.id===equip.id);
  if(!tpl)return;
  // 鍗镐笅褰撳墠瑁呭
  const slot=tpl.type==='weapon'?'weapon':tpl.type==='armor'?'armor':'accessory';
  const oldEquipUid=hero.equipment[slot];
  if(oldEquipUid!=null){
    const oldEq=G.equipment.find(e=>e.uid===oldEquipUid);
    if(oldEq)oldEq.heroUid=null;
  }
  // 瑁呬笂鏂扮殑
  hero.equipment[slot]=equipUid;
  equip.heroUid=heroUid;
  showToast(`${hero.name} 瑁呭浜?${tpl.name}`);
}

function unequipItem(heroUid,slot){
  const hero=G.heroes.find(h=>h.uid===heroUid);
  if(!hero)return;
  const equipUid=hero.equipment[slot];
  if(equipUid==null)return;
  const equip=G.equipment.find(e=>e.uid===equipUid);
  if(equip)equip.heroUid=null;
  hero.equipment[slot]=null;
}

// ==================== 寤虹瓚绯荤粺 ====================
function getBuildingCost(buildingId,level){
  const def=BUILDING_DEFS[buildingId];
  const cost={};
  for(let[k,v]of Object.entries(def.baseCost)){
    cost[k]=Math.floor(v*Math.pow(1.4,level-1));
  }
  return cost;
}

function canAfford(cost){
  for(let[k,v]of Object.entries(cost)){
    if((G.resources[k]||0)<v)return false;
  }
  return true;
}

function upgradeBuilding(buildingId){
  const def=BUILDING_DEFS[buildingId];
  const curLevel=G.buildings[buildingId];
  if(curLevel>=def.maxLevel){showToast('宸茶揪鏈€楂樼瓑绾э紒');return}
  
  const nextLevel=curLevel+1;
  
  // 妫€鏌ョ壒娈婂崌绾ф潯浠讹紙鏀寔鍥哄畾 upgradeReq 鍜屾寜绛夌骇 upgradeReqByLevel锛?  var upgradeReq=null;
  if(def.upgradeReqByLevel && def.upgradeReqByLevel[nextLevel]){
    upgradeReq=def.upgradeReqByLevel[nextLevel];
  }else if(def.upgradeReq){
    upgradeReq=def.upgradeReq;
  }
  
  if(upgradeReq){
    for(let[k,v]of Object.entries(upgradeReq)){
      if((G.resources[k]||0)<v){
        showToast(`鍗囩骇闇€瑕?{RESOURCE_DEFS[k]?.name||k}: ${v}`);
        return;
      }
    }
  }
  
  const cost=getBuildingCost(buildingId,curLevel);
  if(!canAfford(cost)){showToast('璧勬簮涓嶈冻锛?);return}
  
  // 鎵ｉ櫎璧勬簮
  for(let[k,v]of Object.entries(cost))G.resources[k]-=v;
  // 鎵ｉ櫎鐗规畩鏉′欢璧勬簮
  if(upgradeReq){
    for(let[k,v]of Object.entries(upgradeReq))G.resources[k]-=v;
  }
  
  G.buildings[buildingId]++;
  const newLevel=G.buildings[buildingId];
  updateResUI();
  const effectText=def.effects&&def.effects[newLevel-1]?def.effects[newLevel-1]:'';
  showToast(`${def.name} 鍗囩骇鍒?${newLevel} 绾э紒${effectText}`);
  saveGame();
  renderCurrentTab();
}

// ==================== 鎷涘嫙绯荤粺 ====================
function getTavernRefreshCost(){
  // 鍒锋柊璐圭敤缁戝畾閰掗绛夌骇锛堝浐瀹氾紝涓嶉€掑锛?  const tavernLevel=G.buildings.tavern||1;
  return TAVERN_REFRESH.costByLevel[tavernLevel]||TAVERN_REFRESH.costByLevel[1];
}

function canRefreshTavern(){
  const cost=getTavernRefreshCost();
  for(let[k,v]of Object.entries(cost)){
    if((G.resources[k]||0)<v)return false;
  }
  return true;
}

function refreshTavernOptions(){
  if(!canRefreshTavern()){
    const cost=getTavernRefreshCost();
    const costStr=Object.entries(cost).map(([k,v])=>`${RESOURCE_DEFS[k]?.icon||''}${v}`).join(' ');
    showToast(`鍒锋柊闇€瑕? ${costStr}`);
    return;
  }
  
  // 鎵ｉ櫎鍒锋柊璐圭敤锛堝浐瀹氾紝涓嶉€掑锛?  const cost=getTavernRefreshCost();
  for(let[k,v]of Object.entries(cost)){
    G.resources[k]-=v;
  }
  
  // 娓呴櫎缂撳瓨锛屽己鍒堕噸鏂伴殢鏈?  G_tavernOptions=null;
  
  updateResUI();
  saveGame();
  showToast('宸插埛鏂拌嫳闆勫垪琛?);
  // 鍙埛鏂伴厭棣嗗唴瀹癸紝涓嶉€€鍑洪厭棣?  renderTavernRecruit();
}

// 閰掗褰撳墠鏄剧ず鐨勮嫳闆勯€夐」缂撳瓨锛堥伩鍏嶆嫑鍕熷悗閲嶆柊闅忔満锛?var G_tavernOptions = null;
// 閰掗涓凡琚嫑鍕熺殑鑻遍泟ID闆嗗悎
var G_tavernRecruited = new Set();

function getRecruitOptions(){
  // 濡傛灉宸叉湁缂撳瓨锛岀洿鎺ヨ繑鍥烇紙鎷涘嫙鍚庝笉閲嶆柊闅忔満锛?  if(G_tavernOptions && G_tavernOptions.length > 0) return G_tavernOptions;

  const tavernLevel=G.buildings.tavern;
  const maxQuality=TAVERN_REFRESH.maxQualityByLevel[tavernLevel]||'common';
  const maxQIdx=QUALITIES.indexOf(maxQuality);
  const pool=HERO_TEMPLATES.filter(t=>QUALITIES.indexOf(t.quality)<=maxQIdx);
  
  // 鏍规嵁閰掗绛夌骇鍐冲畾閫夐」鏁伴噺
  const optionCount=TAVERN_REFRESH.optionsCount[tavernLevel]||2;
  
  // 鍔犳潈闅忔満锛堝熀纭€鏉冮噸锛?  const weights={common:50,rare:30,epic:15,legendary:4,mythic:1};
  // 鍝佽川鍔犳垚锛氭彁鍗囧綋鍓嶆渶楂樺彲瑙ｉ攣鍝佽川鐨勫嚭鐜扮巼
  const boost=TAVERN_REFRESH.qualityWeightBoost[tavernLevel]||0;
  if(boost>0){
    weights[maxQuality]=Math.round((weights[maxQuality]||10)*(1+boost));
  }
  const options=[];
  for(let i=0;i<optionCount;i++){
    let attempts=0;
    while(attempts<20){
      const tpl=pick(pool);
      const w=weights[tpl.quality]||10;
      if(Math.random()*100<w||attempts>15){
        options.push(tpl);
        break;
      }
      attempts++;
    }
  }
  G_tavernOptions = options;
  G_tavernRecruited = new Set();
  return options;
}

function recruitHero(templateId){
  const tpl=HERO_TEMPLATES.find(t=>t.id===templateId);
  if(!tpl)return;
  // 宸叉嫑鍕熺殑鑻遍泟涓嶈兘閲嶅鎷涘嫙
  if(G_tavernRecruited.has(templateId)){showToast('璇ヨ嫳闆勫凡琚嫑鍕燂紒');return}
  
  // 鎷涘嫙鎴愭湰锛氬墠鏈熼噾甯侊紝鍚庢湡闇€瑕侀捇鐭?  const goldCosts={common:50,rare:150,epic:400,legendary:0,mythic:0};
  const gemCosts={common:0,rare:0,epic:0,legendary:5,mythic:15};
  
  const goldCost=goldCosts[tpl.quality]||50;
  const gemCost=gemCosts[tpl.quality]||0;
  
  // 妫€鏌ヨ祫婧?  if(goldCost>0 && G.resources.gold<goldCost){showToast(`閲戝竵涓嶈冻锛侀渶瑕?${goldCost} 閲戝竵`);return}
  if(gemCost>0 && G.resources.gems<gemCost){showToast(`瀹濈煶涓嶈冻锛侀渶瑕?${gemCost} 瀹濈煶锛屽嚮璐OSS鍙幏寰梎);return}
  
  // 鎵ｉ櫎璧勬簮
  if(goldCost>0) G.resources.gold-=goldCost;
  if(gemCost>0) G.resources.gems-=gemCost;
  
  const hero=createHero(tpl.id);
  G.heroes.push(hero);
  // 鏍囪涓哄凡鎷涘嫙锛堜笉绉婚櫎锛屼繚鎸佸睍绀猴級
  G_tavernRecruited.add(templateId);
  updateResUI();
  saveGame();
  
  const costStr=goldCost>0?`${goldCost}閲戝竵`:gemCost>0?`${gemCost}瀹濈煶`:`${goldCost}閲戝竵+${gemCost}瀹濈煶`;
  showToast(`鎷涘嫙鎴愬姛锛佹秷鑰?${costStr}锛岃幏寰?${hero.icon} ${hero.name}`);
  // 鎷涘嫙鍚庝繚鎸佸湪閰掗锛屽凡鎷涘嫙鐨勬樉绀轰负鐏拌壊绂佺敤
  renderTavernRecruit();
}

// ==================== UI娓叉煋 ====================
let currentTab='town';

function switchTab(tab){
  // H5鐙珛妯″紡绂佸叆閲戞墜鎸?  if(G_isH5Package&&tab==='cheats'){showToast('馃摝 H5鐗堝凡绂佺敤閲戞墜鎸?);return;}
  currentTab=tab;
  document.querySelectorAll('.nav-btn').forEach(b=>{
    b.classList.toggle('active',b.dataset.tab===tab);
  });
  renderCurrentTab();
}

function renderCurrentTab(){
  var contentEl=document.getElementById('content');
  var battlePanel=document.getElementById('battle-panel');
  
  if(G_battleRunning && currentTab==='battle'){
    // 鎴樻枟杩愯涓垏鍥炴垬鏂楅〉锛氭樉绀烘垬鏂楅潰鏉匡紝闅愯棌content
    contentEl.style.display='none';
    battlePanel.style.display='';
  }else if(G_battleRunning && currentTab!=='battle'){
    // 鎴樻枟杩愯涓垏鍒板叾浠栭〉锛氶殣钘忔垬鏂楅潰鏉匡紝鏄剧ずcontent
    battlePanel.style.display='none';
    contentEl.style.display='';
  }else{
    // 娌℃湁鎴樻枟锛氭甯告樉绀篶ontent
    contentEl.style.display='';
    battlePanel.style.display='none';
  }
  
  switch(currentTab){
    case 'town': renderTown(contentEl);break;
    case 'heroes': renderHeroes(contentEl);break;
    case 'team': renderTeam(contentEl);break;
    case 'battle': renderBattle(contentEl);break;
    case 'merge': renderMerge(contentEl);break;
    case 'equip': renderEquip(contentEl);break;
    case 'buildings': renderBuildings(contentEl);break;
    case 'arena': renderArena(contentEl);break;
    case 'cheats': renderCheats(contentEl);break;
  }
}

function renderTown(el){
  var nextStage=getStage(G.stageProgress);
  el.innerHTML=`
    <div class="panel">
      <div class="panel-title"><span class="icon">馃彴</span> 鏆楀奖鍦扮墷</div>
      <div style="color:var(--text2);font-size:12px;line-height:1.8">
        <p>榛戞殫绗肩僵浜嗚繖鐗囧ぇ闄嗐€傛浘缁忕箒鑽ｇ殑甯濆浗宸茬粡瑕嗙伃锛屼骸鐏靛拰鎭堕瓟鍦ㄥ簾澧熶腑娓歌崱銆?/p>
        <p>浣犳槸鏈€鍚庣殑甯屾湜鈥斺€斾竴浣嶆祦娴殑鎸囨尌瀹橈紝蹇呴』鍙泦鑻遍泟锛屾帰绱㈠湴鐗紝鍑昏触榛戞殫鍔垮姏銆?/p>
        <p style="margin-top:8px;color:var(--gold)">褰撳墠杩涘害锛氱 ${G.stageProgress-1} 绔犲凡閫氬叧锛堟棤闄愭ā寮忥級</p>
        <p style="color:var(--text2)">涓嬩竴鍏筹細${nextStage.icon+' '+nextStage.name}</p>
      </div>
    </div>
    <div class="grid-2">
      <div class="panel" style="cursor:pointer" onclick="switchTab('heroes')">
        <div class="panel-title"><span class="icon">鈿旓笍</span> 鑻遍泟绠＄悊</div>
        <div class="text-dim text-sm">绠＄悊浣犵殑鑻遍泟锛屾煡鐪嬪睘鎬у拰鎶€鑳?/div>
        <div style="margin-top:8px;color:var(--gold)">鍏?${G.heroes.length} 浣嶈嫳闆?/div>
      </div>
      <div class="panel" style="cursor:pointer" onclick="switchTab('team')">
        <div class="panel-title"><span class="icon">馃洝锔?/span> 闃熶紞缂栨垚</div>
        <div class="text-dim text-sm">缂栫粍浣犵殑鎴樻枟闃熶紞锛堟渶澶?浜猴級</div>
        <div style="margin-top:8px;color:var(--gold)">宸茬紪鍏?${G.team.filter(t=>t!==null).length}/6</div>
      </div>
      <div class="panel" style="cursor:pointer" onclick="switchTab('battle')">
        <div class="panel-title"><span class="icon">馃拃</span> 鍑哄緛鎴樻枟</div>
        <div class="text-dim text-sm">閫夋嫨鍏冲崱锛岃嚜鍔ㄦ垬鏂?/div>
        <div style="margin-top:8px;color:var(--gold)">涓嬩竴鍏筹細${nextStage?nextStage.name:'宸插叏閮ㄩ€氬叧'}</div>
      </div>
      <div class="panel" style="cursor:pointer" onclick="switchTab('merge')">
        <div class="panel-title"><span class="icon">鈿楋笍</span> 鑻遍泟鍚堟垚</div>
        <div class="text-dim text-sm">铻嶅悎鑻遍泟锛屽垱閫犳洿寮哄姏鐨勫瓨鍦?/div>
        <div style="margin-top:8px;color:var(--gold)">宸插彂鐜?${MERGE_RECIPES.length} 绉嶉厤鏂?/div>
      </div>
      <div class="panel" style="cursor:pointer" onclick="switchTab('equip')">
        <div class="panel-title"><span class="icon">馃棥锔?/span> 瑁呭绠＄悊</div>
        <div class="text-dim text-sm">涓鸿嫳闆勯厤澶囧己鍔涜澶?/div>
        <div style="margin-top:8px;color:var(--gold)">鑳屽寘 ${G.equipment.filter(e=>e.heroUid===null).length} 浠惰澶?/div>
      </div>
      <div class="panel" style="cursor:pointer" onclick="switchTab('buildings')">
        <div class="panel-title"><span class="icon">馃彈锔?/span> 鍩庨晣寤虹瓚</div>
        <div class="text-dim text-sm">鍗囩骇寤虹瓚锛岃В閿佹洿澶氬姛鑳?/div>
        <div style="margin-top:8px;color:var(--gold)">閰掗 Lv.${G.buildings.tavern} | 閾佸尃閾?Lv.${G.buildings.blacksmith}</div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-title"><span class="icon">鈿旓笍</span> 鑷姩鎺ㄥ浘</div>
      <div class="text-dim text-sm mb-8">浠庡綋鍓嶅叧鍗″紑濮嬶紝鑷姩鎴樻枟鐩村埌澶辫触</div>
      <div class="btn-group">
        <button class="btn btn-primary" onclick="startAutoBattle(G.stageProgress)">鈻讹笍 寮€濮嬭嚜鍔ㄦ帹鍥?/button>
      </div>
    </div>
    <div class="panel">
      <div class="panel-title"><span class="icon">馃摐</span> 蹇€熸嫑鍕?/div>
      <div class="text-dim text-sm mb-8">鍦ㄩ厭棣嗘嫑鍕熸柊鑻遍泟锛堝搧璐ㄥ彈閰掗绛夌骇褰卞搷锛?/div>
      <div class="btn-group">
        <button class="btn btn-primary" onclick="renderTavernRecruit()">馃嵑 鍓嶅線閰掗</button>
      </div>
    </div>
    <div class="panel">
      <div class="panel-title"><span class="icon">馃捑</span> 瀛樻。绠＄悊</div>
      <div class="text-dim text-sm mb-8">淇濆瓨鎴栬鍙栨父鎴忚繘搴?/div>
      <div class="btn-group">
        <button class="btn btn-primary" onclick="saveGame()">馃捑 淇濆瓨娓告垙</button>
        <button class="btn" onclick="loadGame();updateResUI();renderCurrentTab();showToast('馃搨 宸茶妗?);">馃搨 璇诲彇瀛樻。</button>
        <button class="btn" style="color:#ff6b6b" onclick="deleteSave()">馃棏锔?鍒犻櫎瀛樻。</button>
      </div>
    </div>
  `;
}

function renderTavernRecruit(){
  const options=getRecruitOptions();
  // 鎷涘嫙鎴愭湰鏄剧ず
  const goldCosts={common:50,rare:150,epic:400,legendary:0,mythic:0};
  const gemCosts={common:0,rare:0,epic:0,legendary:5,mythic:15};
  const content=document.getElementById('content');
  const heroesHTML = options.map(tpl=>{
          const role=ROLES[tpl.role];
          const recruited=G_tavernRecruited.has(tpl.id);
          const goldCost=goldCosts[tpl.quality];
          const gemCost=gemCosts[tpl.quality];
          const costDisplay=gemCost>0?`馃拵 ${gemCost}`:`馃挵 ${goldCost}`;
          if(recruited){
            return`<div class="panel" style="text-align:center;opacity:0.4;pointer-events:none">
              <div style="font-size:40px;margin:8px 0;filter:grayscale(1)">${tpl.icon}</div>
              <div class="q-${tpl.quality}" style="font-size:14px;font-weight:bold">${tpl.name}</div>
              <div class="text-dim text-xs">${QUALITY_NAMES[tpl.quality]} 路 ${role.name}</div>
              <div class="text-dim text-xs mt-4">${role.desc}</div>
              <div class="text-xs mt-4" style="color:var(--text3)">鎶€鑳斤細${tpl.skills.map(s=>SKILLS[s]?SKILLS[s].name:s).join(', ')}</div>
              <div style="margin-top:8px;color:var(--gold)">${costDisplay}</div>
              <button class="btn btn-sm mt-8" style="background:#555;color:#999;cursor:not-allowed" disabled>宸叉嫑鍕?/button>
            </div>`;
          }
          return`<div class="panel" style="text-align:center">
            <div style="font-size:40px;margin:8px 0">${tpl.icon}</div>
            <div class="q-${tpl.quality}" style="font-size:14px;font-weight:bold">${tpl.name}</div>
            <div class="text-dim text-xs">${QUALITY_NAMES[tpl.quality]} 路 ${role.name}</div>
            <div class="text-dim text-xs mt-4">${role.desc}</div>
            <div class="text-xs mt-4" style="color:var(--text3)">鎶€鑳斤細${tpl.skills.map(s=>SKILLS[s]?SKILLS[s].name:s).join(', ')}</div>
            <div style="margin-top:8px;color:var(--gold)">${costDisplay}</div>
            <button class="btn btn-primary btn-sm mt-8" onclick="recruitHero('${tpl.id}')">鎷涘嫙</button>
          </div>`;
        }).join('');
  content.innerHTML=`
    <div class="panel">
      <div class="panel-title"><span class="icon">馃嵑</span> 閰掗鎷涘嫙</div>
      <div class="text-dim text-sm mb-8">閰掗绛夌骇锛?{G.buildings.tavern} | 鏈鍙€夎嫳闆勬暟閲忥細${TAVERN_REFRESH.optionsCount[G.buildings.tavern]||3}${(()=>{var b=TAVERN_REFRESH.qualityWeightBoost[G.buildings.tavern]||0;return b>0?' | 鍝佽川鍔犳垚锛?'+(b*100)+'%':''})()}</div>
      <div class="grid-3">
        ${heroesHTML}
      </div>
      <div class="btn-group mt-12">
        <button class="btn" onclick="renderTown(document.getElementById('content'))">杩斿洖鍩庨晣</button>
        ${(()=>{
          const cost=getTavernRefreshCost();
          const costStr=Object.entries(cost).map(([k,v])=>`${RESOURCE_DEFS[k]?.icon||''}${v}`).join(' ');
          const canRefresh=canRefreshTavern();
          return`<button class="btn ${canRefresh?'':'disabled'}" ${canRefresh?`onclick="refreshTavernOptions()"`:''}>馃攧 鍒锋柊 (${costStr})</button>`;
        })()}
      </div>
    </div>
  `;
}

function renderHeroes(el){
  if(G.heroes.length===0){
    el.innerHTML=`<div class="panel"><div class="panel-title"><span class="icon">鈿旓笍</span> 鑻遍泟鍒楄〃</div><div class="text-dim">杩樻病鏈夎嫳闆勶紝鍘婚厭棣嗘嫑鍕熷惂锛?/div><div class="btn-group mt-8"><button class="btn btn-primary" onclick="renderTavernRecruit()">馃嵑 鍓嶅線閰掗</button></div></div>`;
    return;
  }
  const sorted=[...G.heroes].sort((a,b)=>{
    const qi=QUALITIES.indexOf(a.quality)-QUALITIES.indexOf(b.quality);
    return qi!==0?-qi:b.level-a.level;
  });
  el.innerHTML=`
    <div class="panel">
      <div class="panel-title"><span class="icon">鈿旓笍</span> 鑻遍泟鍒楄〃 (${G.heroes.length})</div>
      <div class="tab-bar">
        <button class="tab-btn active" onclick="filterHeroes('all',this)">鍏ㄩ儴</button>
        ${Object.entries(ROLES).map(([k,v])=>`<button class="tab-btn" onclick="filterHeroes('${k}',this)">${v.icon}${v.name}</button>`).join('')}
      </div>
      <div id="hero-list">
        ${sorted.map(h=>renderHeroCard(h)).join('')}
      </div>
    </div>
  `;
}

function renderHeroCard(h){
  const role=ROLES[h.role];
  const stats=getHeroStats(h);
  const expNeed=getExpToLevel(h.level);
  const allSkills=[...h.skills,...h.bonusSkills];
  const inTeam=G.team.some(t=>t&&t.uid===h.uid);
  return`<div class="hero-card quality-${h.quality}" data-role="${h.role}">
    <div class="hero-avatar" style="background:rgba(${h.quality==='common'?'100,100,100':h.quality==='rare'?'50,100,200':h.quality==='epic'?'130,50,200':h.quality==='legendary'?'200,150,30':'200,50,50'},.15)">
      ${h.icon}
    </div>
    <div class="hero-info">
      <div class="hero-name"><span class="q-${h.quality}">${h.name}</span> ${inTeam?'<span class="text-green text-xs">[闃熶紞涓璢</span>':''}</div>
      <div class="hero-meta">${role.icon} ${role.name} 路 ${QUALITY_NAMES[h.quality]} 路 Lv.${h.level} ${h.bonusSkills.length>0?'<span class="text-purple">鈽呭悎鎴?/span>':''}</div>
      <div class="hero-stats">
        <span class="stat-tag">鉂わ笍<b>${stats.maxHP}</b></span>
        <span class="stat-tag">鈿旓笍<b>${stats.atk}</b></span>
        <span class="stat-tag">馃洝锔?b>${stats.def}</b></span>
        <span class="stat-tag">馃挩<b>${stats.spd}</b></span>
        <span class="stat-tag">馃拵<b>${stats.maxMP}</b></span>
      </div>
      <div class="bar-wrap"><div class="bar-fill" style="width:${(h.exp/expNeed)*100}%;background:var(--exp-bar)"></div></div>
      <div class="text-xs text-dim">EXP: ${h.exp}/${expNeed}</div>
      <div class="hero-skills">${allSkills.map(sid=>{const sk=SKILLS[sid];return sk?`<span class="skill-tag" title="${sk.desc}">${sk.icon}${sk.name}</span>`:''}).join('')}</div>
      <div class="text-xs text-dim mt-4" style="font-style:italic">"${h.lore}"</div>
    </div>
  </div>`;
}

function filterHeroes(role,btn){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.hero-card').forEach(card=>{
    if(role==='all')card.style.display='';
    else card.style.display=card.dataset.role===role?'':'none';
  });
}

function renderTeam(el){
  const available=G.heroes.filter(h=>!G.team.some(t=>t&&t.uid===h.uid));
  el.innerHTML=`
    <div class="panel">
      <div class="panel-title"><span class="icon">馃洝锔?/span> 褰撳墠闃熶紞 (${G.team.filter(t=>t!==null).length}/6)</div>
      <div class="team-grid">
        ${G.team.map((h,i)=>`
          <div class="team-slot" onclick="${h?`removeFromTeam(${i})`:`showTeamPicker(${i})`}">
            ${h?`
              <div style="font-size:28px">${h.icon}</div>
              <div class="q-${h.quality}" style="font-weight:bold;font-size:12px">${h.name}</div>
              <div class="text-xs text-dim">${ROLES[h.role].name} Lv.${h.level}</div>
              <div class="text-xs text-red mt-4">鐐瑰嚮绉婚櫎</div>
            `:`
              <div style="font-size:24px;color:var(--text3)">+</div>
              <div class="text-xs text-dim">绌轰綅</div>
            `}
          </div>
        `).join('')}
      </div>
    </div>
    <div class="panel">
      <div class="panel-title"><span class="icon">馃搵</span> 鍙敤鑻遍泟</div>
      ${available.length===0?'<div class="text-dim">娌℃湁鍙敤鐨勮嫳闆?/div>':''}
      ${available.map(h=>{
        const role=ROLES[h.role];
        return`<div class="hero-card quality-${h.quality}" onclick="quickAddToTeam(${h.uid})" style="cursor:pointer">
          <div class="hero-avatar" style="background:rgba(100,100,100,.1)">${h.icon}</div>
          <div class="hero-info">
            <div class="hero-name"><span class="q-${h.quality}">${h.name}</span></div>
            <div class="hero-meta">${role.icon} ${role.name} 路 Lv.${h.level}</div>
            <div class="hero-stats">
              <span class="stat-tag">鉂わ笍<b>${h.maxHP}</b></span>
              <span class="stat-tag">鈿旓笍<b>${h.atk}</b></span>
              <span class="stat-tag">馃洝锔?b>${h.def}</b></span>
            </div>
            <div class="text-xs text-dim mt-4">鐐瑰嚮蹇€熺紪鍏?/div>
          </div>
        </div>`;
      }).join('')}
    </div>
  `;
}

function showTeamPicker(slotIdx){
  const available=G.heroes.filter(h=>!G.team.some(t=>t&&t.uid===h.uid));
  if(available.length===0){showToast('娌℃湁鍙敤鑻遍泟');return}
  const html=available.map(h=>`
    <div class="hero-card quality-${h.quality}" onclick="addToTeam(${slotIdx},${h.uid});closeModal()" style="cursor:pointer">
      <div class="hero-avatar">${h.icon}</div>
      <div class="hero-info">
        <div class="hero-name"><span class="q-${h.quality}">${h.name}</span></div>
        <div class="hero-meta">${ROLES[h.role].icon} ${ROLES[h.role].name} 路 Lv.${h.level}</div>
      </div>
    </div>
  `).join('');
  showModal('閫夋嫨鑻遍泟',html);
}

function addToTeam(slotIdx,heroUid){
  const hero=G.heroes.find(h=>h.uid===heroUid);
  if(!hero)return;
  G.team[slotIdx]=hero;
  renderCurrentTab();
}

function quickAddToTeam(heroUid){
  const idx=G.team.indexOf(null);
  if(idx===-1){showToast('闃熶紞宸叉弧锛?);return}
  G.team[idx]=G.heroes.find(h=>h.uid===heroUid);
  renderCurrentTab();
}

function removeFromTeam(idx){
  G.team[idx]=null;
  renderCurrentTab();
}

function renderBattle(el){
  // 濡傛灉鎴樻枟姝ｅ湪杩愯锛屾樉绀烘垬鏂楅潰鏉匡紝闅愯棌content
  if(G_battleRunning){
    var battlePanel=document.getElementById('battle-panel');
    if(battlePanel){
      battlePanel.style.display='';
      el.style.display='none';
      return;
    }
  }
  
  const teamHeroes=G.team.filter(h=>h!==null);
  // 鏄剧ず褰撳墠鍏冲崱闄勮繎鐨勫叧鍗?  var showStages=[];
  for(var i=Math.max(1,G.stageProgress-3);i<=G.stageProgress+5;i++){
    showStages.push(getStage(i));
  }
  // 璁＄畻褰撳墠璧勬簮绋€缂哄姞鎴?  var goldRatio=(G.resources.gold||0)/RESOURCE_LIMITS.gold;
  var foodRatio=(G.resources.food||0)/RESOURCE_LIMITS.food;
  var stoneRatio=(G.resources.stone||0)/RESOURCE_LIMITS.stone;
  var ironRatio=(G.resources.iron||0)/RESOURCE_LIMITS.iron;
  var gemRatio=(G.resources.gems||0)/RESOURCE_LIMITS.gems;
  var goldBonus=Math.round((2-Math.min(goldRatio*1.5,1.5))*100);
  var resBonus=Math.round((2-Math.min((foodRatio+stoneRatio+ironRatio)/3*1.5,1.5))*100);
  var gemBonus=Math.round((2-Math.min(gemRatio*1.5,1.5))*100);
  
  el.innerHTML=`
    <div class="panel">
      <div class="panel-title"><span class="icon">馃拃</span> 閫夋嫨鍏冲崱 <span class="text-xs text-dim">锛堟棤闄愭ā寮忥級</span></div>
      <div class="text-dim text-sm mb-8">闃熶紞浜烘暟锛?{teamHeroes.length}/6 ${teamHeroes.length===0?'<span class="text-red">锛堣鍏堢紪闃燂紒锛?/span>':''}</div>
      <div style="background:rgba(0,0,0,0.2);border-radius:8px;padding:10px;margin-bottom:12px;font-size:11px">
        <div style="color:var(--gold);margin-bottom:4px">馃搳 璧勬簮绋€缂哄姞鎴愶紙璧勬簮瓒婂皯濂栧姳瓒婂锛?/div>
        <div>馃挵 閲戝竵濂栧姳: <b style="color:#2ed573">${goldBonus}%</b> | 馃鉀忥笍馃崬 璧勬簮濂栧姳: <b style="color:#2ed573">${resBonus}%</b> | 馃拵 BOSS瀹濈煶: <b style="color:#2ed573">${gemBonus}%</b></div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${showStages.map(s=>{
          const unlocked=s.id<=G.stageProgress;
          const cleared=s.id<G.stageProgress;
          return'<div class="stage-node '+(cleared?'cleared':'')+' '+(s.id===G.stageProgress?'current':'')+' '+(!unlocked?'locked':'')+'"'
            +' onclick="'+(unlocked?'startBattle('+s.id+')':'')+'" title="'+s.desc+'">'
            +'<span class="stage-icon">'+s.icon+'</span>'
            +'<span>'+(s.name.length>8?s.name.substring(0,8)+'鈥?:s.name)+(s.isBoss?' <span class="text-gold">鈽?+(s.bossType==='final'?'鈽呪槄':'')+'Boss</span>':'')+'</span>'
            +'<span class="text-xs text-dim">Lv.'+s.enemies[0].level+'</span>'
            +(cleared?'<span class="text-green text-xs">鉁?/span>':'')
            +'</div>';
        }).join('')}
      </div>
        <div class="btn-group mt-8">
          <button class="btn btn-primary" onclick="startAutoBattle(G.stageProgress)">鈻讹笍 鑷姩鎺ㄥ浘锛堜粠褰撳墠鍏冲崱寮€濮嬶級</button>
        </div>
    </div>
  `;
}

function hideBattlePanel(){
  var panel=document.getElementById('battle-panel');
  if(panel)panel.style.display='none';
  document.getElementById('content').style.display='';
}

function startAutoBattle(fromStage){
  G_autoBattle=true;
  G_currentStageId=fromStage||G.stageProgress;
  startBattle(G_currentStageId);
}

function startBattle(stageId){
  runBattle(stageId);
}

function renderMerge(el){
  var heroCount=G.heroes.length;
  // 鑾峰彇宸查€夎嫳闆?  var usedUids=window._mergeSlots||[null,null,null];
  var usedSet=new Set(usedUids.filter(Boolean));
  
  // 鐢熸垚鍙敤鑻遍泟鍒楄〃HTML
  var heroesHTML=G.heroes.map(function(h){
    var isUsed=usedSet.has(h.uid);
    return '<div class="hero-card quality-'+h.quality+(isUsed?' used':'')+'" onclick="'+(isUsed?'removeMergeHero':'addMergeHero')+'('+h.uid+')" style="cursor:pointer;opacity:'+(isUsed?'0.5':'1')+'">'
      +'<div class="hero-avatar">'+h.icon+'</div>'
      +'<div class="hero-info">'
      +'<div class="hero-name"><span class="q-'+h.quality+'">'+h.name+'</span>'+(isUsed?' <span class="text-green">鉁?/span>':'')+'</div>'
      +'<div class="hero-meta">'+ROLES[h.role].icon+' '+ROLES[h.role].name+' 路 Lv.'+h.level+'</div>'
      +'<div class="hero-stats text-xs text-dim">鉂わ笍'+h.maxHP+' 鈿旓笍'+h.atk+' 馃洝锔?+h.def+'</div>'
      +'</div></div>';
  }).join('');
  
  el.innerHTML=`
    <div class="panel">
      <div class="panel-title"><span class="icon">鈿楋笍</span> 鑻遍泟铻嶅悎</div>
      <div class="text-dim text-sm mb-8">鐐瑰嚮涓嬫柟鑻遍泟娣诲姞鍒板悎鎴愭锛岄€夋嫨2-3涓嫳闆勮繘琛岃瀺鍚?/div>
      <div class="merge-slots" id="merge-slots">
        <div class="merge-slot" id="merge-slot-0">?</div>
        <div class="merge-slot" id="merge-slot-1">?</div>
        <div class="merge-slot" id="merge-slot-2">?</div>
        <div class="merge-arrow">鈫?/div>
        <div class="merge-result" id="merge-result">?</div>
      </div>
      <div id="merge-preview" class="text-dim text-sm mt-8">璇烽€夋嫨鑷冲皯2涓嫳闆勮繘琛岃瀺鍚?/div>
      <div class="btn-group mt-8">
        <button class="btn btn-primary" id="merge-btn" onclick="doMerge()" disabled>寮€濮嬭瀺鍚?/button>
        <button class="btn" onclick="clearMerge()">娓呯┖</button>
      </div>
    </div>
    <div class="panel">
      <div class="panel-title"><span class="icon">馃摉</span> 铻嶅悎瑙勫垯</div>
      <div class="text-dim text-sm" style="line-height:2">
        <div>鈿楋笍 <b>浠绘剰铻嶅悎</b>锛氫换浣?-3涓嫳闆勯兘鍙互铻嶅悎锛屼笉鍙楅厤鏂归檺鍒?/div>
        <div>馃搳 <b>鍝佽川闄愬埗</b>锛氳瀺鍚堣嫳闆勫搧璐?鈮?琚瀺鍚堟渶楂樺搧璐?/div>
        <div>馃幉 <b>鎶€鑳界户鎵?/b>锛氶殢鏈虹户鎵挎潗鏂欒嫳闆勭殑鎶€鑳?/div>
        <div>馃搱 <b>灞炴€х户鎵?/b>锛氶殢鏈虹户鎵挎潗鏂欒嫳闆勭殑灞炴€?/div>
        <div>鈽ｏ笍 <b>寮傚彉</b>锛?0%姒傜巼鍙戠敓寮傚彉锛屽睘鎬?鎶€鑳芥洿寮?/div>
        <div>猬嗭笍 <b>鍝佽川鎻愬崌</b>锛?%姒傜巼鍝佽川+1锛堝繀瀹氬紓鍙橈級</div>
        <div>馃専 <b>绁炶瘽闄嶄复</b>锛?%姒傜巼鐩存帴鑾峰緱绁炶瘽鍝佽川锛堝繀瀹氬紓鍙橈級</div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-title"><span class="icon">馃懃</span> 鍙敤鑻遍泟 (${heroCount}) <span class="text-xs text-dim">鐐瑰嚮娣诲姞/绉婚櫎</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px">${heroesHTML}</div>
    </div>
  `;
  if(!window._mergeSlots) window._mergeSlots=[null,null,null];
  updateMergeUI();
}

function addMergeHero(heroUid){
  // 鎵惧埌绗竴涓┖妲戒綅
  for(var i=0;i<3;i++){
    if(!window._mergeSlots[i]){
      window._mergeSlots[i]=heroUid;
      renderMerge(document.getElementById('content'));
      return;
    }
  }
  showToast('鍚堟垚妗嗗凡婊★紙鏈€澶?涓級');
}

function removeMergeHero(heroUid){
  // 鎵惧埌骞剁Щ闄よ鑻遍泟
  for(var i=0;i<3;i++){
    if(window._mergeSlots[i]===heroUid){
      window._mergeSlots[i]=null;
      renderMerge(document.getElementById('content'));
      return;
    }
  }
}

function showMergePicker(slotIdx){
  const usedUids=window._mergeSlots.filter(Boolean);
  const available=G.heroes.filter(h=>!usedUids.includes(h.uid));
  if(available.length===0){showToast('娌℃湁鍙敤鑻遍泟');return}
  const html=available.map(h=>`
    <div class="hero-card quality-${h.quality}" onclick="pickMergeHero(${slotIdx},${h.uid})" style="cursor:pointer">
      <div class="hero-avatar">${h.icon}</div>
      <div class="hero-info">
        <div class="hero-name"><span class="q-${h.quality}">${h.name}</span></div>
        <div class="hero-meta">${ROLES[h.role].icon} ${ROLES[h.role].name} 路 Lv.${h.level}</div>
      </div>
    </div>
  `).join('');
  showModal('閫夋嫨鍚堟垚鏉愭枡',html);
}

function pickMergeHero(slotIdx,heroUid){
  window._mergeSlots[slotIdx]=heroUid;
  closeModal();
  updateMergeUI();
}

function updateMergeUI(){
  const slots=window._mergeSlots;
  for(let i=0;i<3;i++){
    const el=document.getElementById('merge-slot-'+i);
    const hero=slots[i]?G.heroes.find(h=>h.uid===slots[i]):null;
    if(hero){
      el.innerHTML='<div style="text-align:center"><div style="font-size:28px">'+hero.icon+'</div><div class="text-xs q-'+hero.quality+'">'+hero.name+'</div><div class="text-xs text-dim">Lv.'+hero.level+'</div></div>';
      el.classList.add('filled','quality-'+hero.quality);
    }else{
      el.innerHTML='?';
      el.classList.remove('filled');
      el.className='merge-slot';
    }
  }
  const activeSlots=slots.filter(Boolean);
  const resultEl=document.getElementById('merge-result');
  const previewEl=document.getElementById('merge-preview');
  const btn=document.getElementById('merge-btn');

  if(activeSlots.length>=2){
    const heroes=activeSlots.map(uid=>G.heroes.find(h=>h.uid===uid)).filter(Boolean);
    if(heroes.length>=2){
      // 棰勮铻嶅悎缁撴灉锛堥渶瑕侀噾鎵嬫寚寮€鍚?showMergeResult 鎵嶆樉绀猴級
      if(G_cheats.enabled && G_cheats.showMergeResult){
        var preview=generateFusedHero(heroes);
        resultEl.innerHTML='<div style="text-align:center"><div style="font-size:32px">'+preview.icon+'</div><div class="text-xs q-'+preview.quality+'" style="font-weight:bold">'+preview.name+'</div><div class="text-xs text-dim">'+ROLES[preview.role].icon+' '+ROLES[preview.role].name+'</div></div>';
        var skillNames=preview.skills.map(function(s){return SKILLS[s]?SKILLS[s].icon+SKILLS[s].name:s}).join(' ');
        previewEl.innerHTML='<span class="text-green">鉁?鍙瀺鍚堬細'+preview.icon+' '+preview.name+' ('+QUALITY_NAMES[preview.quality]+')</span>'
          +'<br><span class="text-xs text-dim">鉂わ笍'+preview.maxHP+' 鈿旓笍'+preview.atk+' 馃洝锔?+preview.def+' 馃弮'+preview.spd+' 馃挧'+preview.maxMP+'</span>'
          +'<br><span class="text-xs text-purple">鎶€鑳斤細'+skillNames+'</span>';
      }else{
        // 榛樿闅愯棌缁撴灉
        resultEl.innerHTML='<div style="text-align:center"><div style="font-size:32px">鉂?/div><div class="text-xs text-dim">???</div></div>';
        previewEl.innerHTML='<span class="text-green">鉁?宸查€夋嫨 '+heroes.length+' 涓嫳闆勶紝鍙繘琛岃瀺鍚?/span><br><span class="text-xs text-dim">锛堝紑鍚噾鎵嬫寚鍙瑙堢粨鏋滐級</span>';
      }
      btn.disabled=false;
    }else{
      resultEl.innerHTML='?';
      previewEl.innerHTML='<span class="text-red">鑻遍泟涓嶅瓨鍦?/span>';
      btn.disabled=true;
    }
  }else{
    resultEl.innerHTML='?';
    previewEl.innerHTML='璇烽€夋嫨鑷冲皯2涓嫳闆勮繘琛岃瀺鍚?;
    btn.disabled=true;
  }
}

function doMerge(){
  const activeSlots=window._mergeSlots.filter(Boolean);
  if(executeMerge(activeSlots)){
    window._mergeSlots=[null,null,null];
    renderMerge(document.getElementById('content'));
  }
}

function clearMerge(){
  window._mergeSlots=[null,null,null];
  renderMerge(document.getElementById('content'));
}

function renderEquip(el){
  const unequipped=G.equipment.filter(e=>e.heroUid===null);
  const equipped=G.equipment.filter(e=>e.heroUid!==null);
  let unequippedHTML='';
  unequipped.forEach(eq=>{
    const tpl=EQUIP_TEMPLATES.find(t=>t.id===eq.id);
    if(!tpl)return;
    const statsStr=Object.entries(tpl.stats).map(([k,v])=>{const icons={atk:'鈿旓笍',def:'馃洝锔?,hp:'鉂わ笍',mp:'馃拵',spd:'馃挩'};return(icons[k]||'')+v}).join(' ');
    unequippedHTML+='<div class="equip-slot quality-'+tpl.quality+'">'
      +'<span class="equip-icon">'+tpl.icon+'</span>'
      +'<span class="equip-name q-'+tpl.quality+'">'+tpl.name+' <span class="text-dim text-xs">('+QUALITY_NAMES[tpl.quality]+')</span></span>'
      +'<span class="equip-stats">'+statsStr+'</span>'
      +'<button class="btn btn-sm" onclick="showEquipToHero('+eq.uid+')">瑁呭</button>'
      +'</div>';
  });
  let equippedHTML='';
  equipped.forEach(eq=>{
    const tpl=EQUIP_TEMPLATES.find(t=>t.id===eq.id);
    const hero=G.heroes.find(h=>h.uid===eq.heroUid);
    if(!tpl||!hero)return;
    const slotName=tpl.type==='weapon'?'姝﹀櫒':tpl.type==='armor'?'鎶ょ敳':'楗板搧';
    const slotKey=tpl.type==='weapon'?'weapon':tpl.type==='armor'?'armor':'accessory';
    equippedHTML+='<div class="equip-slot quality-'+tpl.quality+'">'
      +'<span class="equip-icon">'+tpl.icon+'</span>'
      +'<span class="equip-name"><span class="q-'+tpl.quality+'">'+tpl.name+'</span> 鈫?'+hero.icon+hero.name+' <span class="text-dim text-xs">['+slotName+']</span></span>'
      +'<button class="btn btn-sm btn-danger" onclick="unequipFromHero('+eq.heroUid+',\''+slotKey+'\')">鍗镐笅</button>'
      +'</div>';
  });
  el.innerHTML='<div class="panel">'
    +'<div class="panel-title"><span class="icon">馃帓</span> 鑳屽寘 ('+unequipped.length+'浠?</div>'
    +(unequipped.length===0?'<div class="text-dim">鑳屽寘涓虹┖</div>':unequippedHTML)
    +'</div>'
    +'<div class="panel">'
    +'<div class="panel-title"><span class="icon">馃懁</span> 宸茶澶?/div>'
    +(equipped.length===0?'<div class="text-dim">娌℃湁宸茶澶囩殑鐗╁搧</div>':equippedHTML)
    +'</div>'
    +'<div class="panel">'
    +'<div class="panel-title"><span class="icon">馃敤</span> 閾佸尃閾?<span class="text-blue">Lv.'+(G.buildings.blacksmith||0)+'</span></div>'
    +'<div class="text-dim text-sm mb-8">閿婚€犺澶囬渶瑕侀搧鐭匡紝鍝佽川鍙楅搧鍖犻摵绛夌骇闄愬埗</div>'
    +'<div class="btn-group">'
    +'<button class="btn btn-primary" onclick="forgeEquipment(\'common\')">馃敤 鏅€?(馃挵100 鉀忥笍5)</button>'
    +'<button class="btn btn-primary" onclick="forgeEquipment(\'rare\')">馃敤 绋€鏈?(馃挵300 鉀忥笍15)</button>'
    +'<button class="btn btn-primary" onclick="forgeEquipment(\'epic\')">馃敤 鍙茶瘲 (馃挵800 鉀忥笍40)</button>'
    +'<button class="btn btn-primary" onclick="forgeEquipment(\'legendary\')">馃敤 浼犺 (馃挵2000 鉀忥笍100)</button>'
    +'<button class="btn btn-primary" onclick="forgeEquipment(\'mythic\')">馃敤 绁炶瘽 (馃挵5000 鉀忥笍250)</button>'
    +'</div></div>';
}

function showEquipToHero(equipUid){
  const heroes=G.heroes;
  if(heroes.length===0){showToast('娌℃湁鑻遍泟');return}
  const html=heroes.map(h=>`
    <div class="hero-card quality-${h.quality}" onclick="equipItem(${h.uid},${equipUid});closeModal();renderCurrentTab()" style="cursor:pointer">
      <div class="hero-avatar">${h.icon}</div>
      <div class="hero-info">
        <div class="hero-name"><span class="q-${h.quality}">${h.name}</span></div>
        <div class="hero-meta">${ROLES[h.role].icon} ${ROLES[h.role].name} 路 Lv.${h.level}</div>
      </div>
    </div>
  `).join('');
  showModal('閫夋嫨瑁呭瀵硅薄',html);
}

function unequipFromHero(heroUid,slot){
  unequipItem(heroUid,slot);
  showToast('宸插嵏涓嬭澶?);
  renderCurrentTab();
}

function forgeEquipment(maxQuality){
  // 妫€鏌ラ搧鍖犻摵绛夌骇鏄惁鍏佽閿婚€犺鍝佽川
  var bsLevel=G.buildings.blacksmith||0;
  var bsDef=BUILDING_DEFS.blacksmith;
  var allowedQuality=bsDef.forgeQualityByLevel[bsLevel]||'common';
  var allowedIdx=QUALITIES.indexOf(allowedQuality);
  var requestIdx=QUALITIES.indexOf(maxQuality);
  if(requestIdx>allowedIdx){
    showToast('閾佸尃閾虹瓑绾т笉瓒筹紒褰撳墠鏈€楂樺彲閿婚€狅細'+QUALITY_NAMES[allowedQuality]+'锛岄渶瑕侀搧鍖犻摵 Lv.'+(requestIdx+1));
    return;
  }
  // 閿婚€犺垂鐢細閲戝竵+閾佺熆锛堝搧璐ㄨ秺楂樻秷鑰楄秺澶氾級
  var ironCosts={common:3,rare:8,epic:20,legendary:50,mythic:120};
  var goldCosts={common:50,rare:150,epic:400,legendary:1000,mythic:2500};
  var cost={gold:goldCosts[maxQuality]||100,iron:ironCosts[maxQuality]||5};
  if(!canAfford(cost)){showToast('璧勬簮涓嶈冻锛侀渶瑕?'+RESOURCE_DEFS.gold.icon+cost.gold+' '+RESOURCE_DEFS.iron.icon+cost.iron);return}
  for(let[k,v]of Object.entries(cost))G.resources[k]-=v;
  var maxQIdx=QUALITIES.indexOf(maxQuality);
  var pool=EQUIP_TEMPLATES.filter(t=>QUALITIES.indexOf(t.quality)<=maxQIdx);
  var tpl=pool.length>0?pick(pool):EQUIP_TEMPLATES[0];
  var eq=createEquipment(tpl.id);
  G.equipment.push(eq);
  updateResUI();
  showToast('閿婚€犳垚鍔燂紒鑾峰緱 '+tpl.icon+' '+tpl.name+' ('+QUALITY_NAMES[tpl.quality]+')');
  renderCurrentTab();
}

function renderBuildings(el){
  // 杩涘叆寤虹瓚椤甸潰鏃惰Е鍙戣祫婧愮敓浜?  produceResources();
  
  // 璁＄畻鍚勫缓绛戜骇鍑洪€熺巼
  var farmLevel=G.buildings.farm||0;
  var farmFoodRate=farmLevel>0?BUILDING_DEFS.farm.foodProductionByLevel[farmLevel]:0;
  var mineLevel=G.buildings.mine||0;
  var mineStoneRate=mineLevel>0?BUILDING_DEFS.mine.stoneProductionByLevel[mineLevel]:0;
  var mineIronRate=mineLevel>0?BUILDING_DEFS.mine.ironProductionByLevel[mineLevel]:0;
  
  el.innerHTML=`
    <div class="panel">
      <div class="panel-title"><span class="icon">馃彈锔?/span> 鍩庨晣寤虹瓚</div>
      <div class="text-dim text-sm mb-8">鍗囩骇寤虹瓚瑙ｉ攣鏇村鍔熻兘锛岄厭棣嗗崌绾ч渶瑕佸０鏈?/div>
      
      <!-- 璧勬簮浜у嚭姒傝 -->
       <div style="background:rgba(0,0,0,0.2);border-radius:8px;padding:12px;margin-bottom:16px">
         <div style="font-weight:bold;margin-bottom:8px">馃搳 姣忓垎閽熻祫婧愪骇鍑?/div>
         <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:12px">
           <span>馃尵 鍐滃満: <b style="color:#2ed573">+${(farmFoodRate/60).toFixed(1)}</b> 椋熺墿/鍒嗛挓</span>
           <span>鉀忥笍 鐭垮満: <b style="color:#ffa502">+${(mineStoneRate/60).toFixed(1)}</b> 鐭虫潗/鍒嗛挓</span>
           <span>鉀忥笍 鐭垮満: <b style="color:#70a1ff">+${(mineIronRate/60).toFixed(1)}</b> 閾佺熆/鍒嗛挓</span>
         </div>
       </div>
      
      ${Object.entries(BUILDING_DEFS).map(([id,def])=>{
        const level=G.buildings[id];
        const maxed=level>=def.maxLevel;
        const cost=maxed?{}:getBuildingCost(id,level);
        const costStr=Object.entries(cost).map(([k,v])=>`${RESOURCE_DEFS[k]?.icon||''}${v}`).join(' ');
        // 妫€鏌ョ壒娈婂崌绾ф潯浠讹紙鏀寔 upgradeReqByLevel锛?        let reqStr='';
        let canUpReq=true;
        if(!maxed){
          var nextLv=level+1;
          var ureq=null;
          if(def.upgradeReqByLevel && def.upgradeReqByLevel[nextLv]){
            ureq=def.upgradeReqByLevel[nextLv];
          }else if(def.upgradeReq){
            ureq=def.upgradeReq;
          }
          if(ureq){
            reqStr=Object.entries(ureq).map(([k,v])=>`${RESOURCE_DEFS[k]?.icon||''}${v}`).join(' ');
            canUpReq=Object.entries(ureq).every(([k,v])=>(G.resources[k]||0)>=v);
          }
        }
        const canUp=!maxed&&canAfford(cost)&&canUpReq;
        const currentEffect=def.effects&&level>0?def.effects[level-1]:'';
        const nextEffect=!maxed&&def.effects?def.effects[level]:'';
        return`<div class="building-card">
          <div class="building-icon">${def.icon}</div>
          <div class="building-info">
            <div class="building-name">${def.name} <span class="text-blue">Lv.${level}</span>${maxed?' <span class="text-gold text-xs">MAX</span>':''}</div>
            <div class="building-desc">${def.desc}</div>
            <div class="text-xs" style="color:var(--gold)">褰撳墠锛?{currentEffect}</div>
            ${!maxed?`<div class="text-xs" style="color:var(--text2)">涓嬬骇锛?{nextEffect}</div>`:''}
            <div class="building-level">${maxed?'宸茶揪鏈€楂樼瓑绾?:`璐圭敤锛?{costStr}${reqStr?' + 闇€瑕侊細'+reqStr:''}`}</div>
          </div>
          ${!maxed?`<button class="btn ${canUp?'btn-primary':''}" ${canUp?`onclick="upgradeBuilding('${id}')"`:'disabled'}>鍗囩骇</button>`:''}
        </div>`;
      }).join('')}
    </div>
    <div class="panel">
      <div class="panel-title"><span class="icon">馃摉</span> 寤虹瓚璇存槑</div>
      <div class="text-dim text-sm" style="line-height:2">
        <div>馃嵑 <b>閰掗</b>锛氭嫑鍕熻嫳闆勶紝鍗囩骇瑙ｉ攣鏇撮珮鍝佽川+鎻愬崌楂樺搧璐ㄥ嚭鐜扮巼锛堥渶瑕佸０鏈涴煆嗭級</div>
        <div>馃尵 <b>鍐滃満</b>锛氱敓浜ч鐗煃烇紝鐢ㄤ簬閰掗鍒锋柊</div>
        <div>鉀忥笍 <b>鐭垮満</b>锛氬紑閲囩煶鏉愷煪ㄥ拰閾佺熆鉀忥笍锛屽缓绛戝拰閿婚€犳潗鏂?/div>
        <div>馃敤 <b>閾佸尃閾?/b>锛氶敾閫犺澶囷紝娑堣€楅噾甯?閾佺熆鉀忥笍锛岀瓑绾ч檺鍒跺搧璐?/div>
        <div>鉀?<b>绁炴</b>锛氭彁鍗囪嫳闆勭瓑绾т笂闄愶紙鏃犵娈夸笂闄?0绾э級</div>
        <div>馃彑锔?<b>绔炴妧鍦?/b>锛氭寫鎴樿幏鍙栧０鏈涴煆嗗拰閲戝竵</div>
      </div>
    </div>
  `;
}

function renderArena(el){
  var arenaLevel=G.buildings.arena||0;
  var remaining=getArenaRemainingChallenges();
  var dailyLimit=getArenaDailyLimit();
  
  if(arenaLevel===0){
    el.innerHTML=`<div class="panel">
      <div class="panel-title"><span class="icon">馃彑锔?/span> 绔炴妧鍦?/div>
      <div class="text-dim text-sm mb-8">闇€瑕佸厛寤洪€犵珵鎶€鍦烘墠鑳芥寫鎴?/div>
      <button class="btn btn-primary" onclick="switchTab('buildings')">鍓嶅線寤虹瓚椤甸潰</button>
    </div>`;
    return;
  }
  
  el.innerHTML=`<div class="panel">
    <div class="panel-title"><span class="icon">馃彑锔?/span> 绔炴妧鍦?<span class="text-blue">Lv.${arenaLevel}</span></div>
    
    <!-- 缁熻淇℃伅 -->
    <div style="background:rgba(0,0,0,0.2);border-radius:8px;padding:12px;margin-bottom:16px">
      <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:12px">
        <span>浠婃棩鍓╀綑: <b style="color:#2ed573">${remaining}/${dailyLimit}</b></span>
        <span>杩炶儨: <b style="color:#ffd700">${G.arenaState.winStreak}</b></span>
        <span>鎬昏儨鍦? <b style="color:#4a9eff">${G.arenaState.totalWins}</b></span>
        <span>鎬昏触鍦? <b style="color:#ff6b6b">${G.arenaState.totalLosses}</b></span>
      </div>
    </div>
    
    <div class="text-dim text-sm mb-8">瀵规墜鏍规嵁浣犵殑闃熶紞绛夌骇銆佸搧璐ㄥ拰浜烘暟鐢熸垚</div>
    
    <!-- 闅惧害閫夋嫨 -->
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px">
      <div style="flex:1;min-width:150px;background:rgba(46,213,115,0.1);border-radius:8px;padding:12px;text-align:center">
        <div style="font-size:24px;margin-bottom:8px">馃煝</div>
        <div style="font-weight:bold;color:#2ed573">绠€鍗?/div>
        <div class="text-xs text-dim">绛夌骇脳60% 鏈€楂樼█鏈?/div>
        <div class="text-xs text-dim">濂栧姳脳0.8</div>
        <button class="btn btn-sm mt-8" onclick="startArenaBattle('easy')" ${remaining<=0?'disabled':''}>鎸戞垬</button>
      </div>
      <div style="flex:1;min-width:150px;background:rgba(255,193,7,0.1);border-radius:8px;padding:12px;text-align:center">
        <div style="font-size:24px;margin-bottom:8px">馃煛</div>
        <div style="font-weight:bold;color:#ffc107">鏅€?/div>
        <div class="text-xs text-dim">绛夌骇脳90% 鏈€楂樺彶璇?/div>
        <div class="text-xs text-dim">濂栧姳脳1.0</div>
        <button class="btn btn-sm mt-8" onclick="startArenaBattle('normal')" ${remaining<=0?'disabled':''}>鎸戞垬</button>
      </div>
      <div style="flex:1;min-width:150px;background:rgba(255,107,107,0.1);border-radius:8px;padding:12px;text-align:center">
        <div style="font-size:24px;margin-bottom:8px">馃敶</div>
        <div style="font-weight:bold;color:#ff6b6b">鍥伴毦</div>
        <div class="text-xs text-dim">绛夌骇脳120% 鏈€楂樹紶璇?/div>
        <div class="text-xs text-dim">濂栧姳脳1.5</div>
        <button class="btn btn-sm mt-8" onclick="startArenaBattle('hard')" ${remaining<=0?'disabled':''}>鎸戞垬</button>
      </div>
    </div>
    
    <!-- 杩炶儨鍔犳垚璇存槑 -->
    <div style="background:rgba(255,215,0,0.1);border-radius:8px;padding:12px">
      <div style="font-weight:bold;margin-bottom:8px;color:#ffd700">馃敟 杩炶儨鍔犳垚</div>
      <div style="font-size:12px;line-height:1.8">
        <div>2杩炶儨: +10% 濂栧姳</div>
        <div>3杩炶儨: +20% 濂栧姳</div>
        <div>5杩炶儨: +30% 濂栧姳</div>
        <div>10杩炶儨: +50% 濂栧姳</div>
      </div>
    </div>
  </div>`;
}


// ==================== 閲戞墜鎸囩郴缁燂紙瀵嗙爜瑙ｉ攣锛?====================
var G_cheats = {
  enabled: false,
  unlocked: false,
  godMode: false,
  infiniteMP: false,
  oneHitKill: false,
  forceMutation: false,
  showMergeResult: false  // 榛樿闅愯棌鍚堟垚缁撴灉
};

function renderCheats(el){
  if(!G_cheats.unlocked){
    el.innerHTML=`
      <div class="panel">
        <div class="panel-title"><span class="icon">馃敀</span> 閲戞墜鎸囩郴缁?/div>
        <div style="text-align:center;padding:20px 0">
          <div style="font-size:48px;margin-bottom:16px">馃敀</div>
          <div style="font-size:16px;font-weight:bold;color:var(--gold);margin-bottom:8px">閲戞墜鎸囧凡閿佸畾</div>
          <div class="text-dim text-sm mb-8">璇疯緭鍏ヨВ閿佸瘑鐮?/div>
          <div style="max-width:280px;margin:0 auto">
            <input type="password" id="cheat-password-input" style="width:100%;padding:10px 14px;border:1px solid var(--gold);background:var(--panel2);color:var(--text);border-radius:6px;font-size:16px;text-align:center;font-family:inherit;outline:none" placeholder="璇疯緭鍏ュ瘑鐮? autocomplete="off">
            <div class="text-dim text-xs mt-8">馃挕 鎻愮ず锛氳仈绯籕Q741929749鑾峰彇瀵嗙爜</div>
            <div class="btn-group" style="justify-content:center;margin-top:12px">
              <button class="btn btn-primary" onclick="unlockCheats()" style="padding:10px 40px;font-size:15px">馃敁 瑙ｉ攣</button>
            </div>
            <div id="cheat-error" class="text-red text-sm mt-8" style="display:none"></div>
          </div>
        </div>
      </div>
    `;
    return;
  }
  el.innerHTML=`
    <div class="panel">
      <div class="panel-title"><span class="icon">馃敁</span> 閲戞墜鎸囩郴缁?<span class="text-green text-xs">鉁?宸茶В閿?/span></div>
      <div class="text-dim text-sm mb-8">鈿狅笍 閲戞墜鎸囦細鐮村潖娓告垙骞宠　</div>
      <div class="btn-group mb-8">
        <button class="btn ${G_cheats.enabled?'btn-danger':'btn-primary'}" onclick="toggleCheats()">${G_cheats.enabled?'馃敀 鍏抽棴閲戞墜鎸?:'馃敁 寮€鍚噾鎵嬫寚'}</button>
      </div>
      <div id="cheat-panel" style="display:${G_cheats.enabled?'block':'none'}">
        <div class="panel" style="background:rgba(192,57,43,.1);border-color:rgba(192,57,43,.3)">
          <div class="panel-title">馃挵 璧勬簮淇敼</div>
          <div class="btn-group">
            <button class="btn" onclick="cheatGold()">閲戝竵+999999</button>
            <button class="btn" onclick="cheatGems()">瀹濈煶+999</button>
            <button class="btn btn-primary" onclick="cheatAllResources()">鍏ㄩ儴璧勬簮鍔犳弧</button>
          </div>
        </div>
        <div class="panel" style="background:rgba(142,68,173,.1);border-color:rgba(142,68,173,.3)">
          <div class="panel-title">猸?瑙掕壊淇敼</div>
          <div class="btn-group">
            <button class="btn" onclick="cheatMaxLevel()">鎵€鏈夎嫳闆?0绾?/button>
            <button class="btn" onclick="cheatUnlockAll()">瑙ｉ攣鎵€鏈夎嫳闆?/button>
          </div>
        </div>
        <div class="panel" style="background:rgba(41,128,185,.1);border-color:rgba(41,128,185,.3)">
          <div class="panel-title">鈿旓笍 鎴樻枟淇敼</div>
          <div class="btn-group">
            <button class="btn ${G_cheats.godMode?'btn-primary':''}" onclick="cheatGodMode()">${G_cheats.godMode?'馃洝锔?鏃犳晫[寮€]':'馃洝锔?鏃犳晫[鍏砞'}</button>
            <button class="btn ${G_cheats.oneHitKill?'btn-primary':''}" onclick="cheatOneHitKill()">${G_cheats.oneHitKill?'鈿旓笍 涓€鍑诲繀鏉€[寮€]':'鈿旓笍 涓€鍑诲繀鏉€[鍏砞'}</button>
            <button class="btn ${G_cheats.infiniteMP?'btn-primary':''}" onclick="cheatInfiniteMP()">${G_cheats.infiniteMP?'馃敭 鏃犻檺钃漑寮€]':'馃敭 鏃犻檺钃漑鍏砞'}</button>
          </div>
        </div>
        <div class="panel" style="background:rgba(155,89,182,.1);border-color:rgba(155,89,182,.3)">
          <div class="panel-title">鈿楋笍 铻嶅悎鐩稿叧</div>
          <div class="btn-group">
            <button class="btn ${G_cheats.forceMutation?'btn-primary':''}" onclick="cheatForceMutation()">${G_cheats.forceMutation?'鈽ｏ笍 寮哄埗寮傚彉[寮€]':'鈽ｏ笍 寮哄埗寮傚彉[鍏砞'}</button>
            <button class="btn ${G_cheats.showMergeResult?'btn-primary':''}" onclick="cheatShowMergeResult()">${G_cheats.showMergeResult?'馃敭 鏄剧ず鍚堟垚缁撴灉[寮€]':'馃敭 鏄剧ず鍚堟垚缁撴灉[鍏砞'}</button>
          </div>
        </div>
        <div class="panel" style="background:rgba(39,174,96,.1);border-color:rgba(39,174,96,.3)">
          <div class="panel-title">鈴笍 鍏冲崱淇敼</div>
          <div class="btn-group">
            <button class="btn" onclick="cheatSkipStage()">璺宠繃褰撳墠鍏冲崱</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function unlockCheats(){
  var input=document.getElementById('cheat-password-input');
  var err=document.getElementById('cheat-error');
  if(!input||!err)return;
  var pwd=input.value.trim();
  if(pwd==='741929749'){
    G_cheats.unlocked=true;
    G_cheats.enabled=true;
    showToast('馃敁 閲戞墜鎸囧凡瑙ｉ攣锛?);
    renderCurrentTab();
  }else{
    err.textContent='鉂?瀵嗙爜閿欒锛岃鑱旂郴QQ741929749鑾峰彇姝ｇ‘瀵嗙爜';
    err.style.display='block';
    input.value='';
    input.focus();
  }
}

function toggleCheats(){
  G_cheats.enabled = !G_cheats.enabled;
  showToast(G_cheats.enabled ? '馃敁 閲戞墜鎸囧凡寮€鍚? : '馃敀 閲戞墜鎸囧凡鍏抽棴');
  updateCheatPanel();
}

function cheatGold(){
  if(!G_cheats.enabled){showToast('璇峰厛寮€鍚噾鎵嬫寚');return;}
  G.resources.gold += 999999;
  updateResUI();
  showToast('馃挵 閲戝竵 +999999');
}

function cheatGems(){
  if(!G_cheats.enabled){showToast('璇峰厛寮€鍚噾鎵嬫寚');return;}
  G.resources.gems += 999;
  updateResUI();
  showToast('馃拵 瀹濈煶 +999');
}

function cheatAllResources(){
  if(!G_cheats.enabled){showToast('璇峰厛寮€鍚噾鎵嬫寚');return;}
  G.resources.gold += 999999;
  G.resources.gems += 999;
  G.resources.stone += 999;
  G.resources.iron += 999;
  G.resources.food += 999;
  G.resources.fame += 999;
  updateResUI();
  showToast('馃摝 鎵€鏈夎祫婧愬凡鍔犳弧');
}

function cheatMaxLevel(){
  if(!G_cheats.enabled){showToast('璇峰厛寮€鍚噾鎵嬫寚');return;}
  G.heroes.forEach(function(h){
    h.level = 50;
    h.exp = 0;
    h.maxHP = Math.floor(h.maxHP * (1 + (h.level - 1) * 0.15));
    h.atk = Math.floor(h.atk * (1 + (h.level - 1) * 0.12));
    h.def = Math.floor(h.def * (1 + (h.level - 1) * 0.10));
  });
  showToast('猸?鎵€鏈夎嫳闆勫凡鍗囪嚦50绾?);
}

function cheatGodMode(){
  if(!G_cheats.enabled){showToast('璇峰厛寮€鍚噾鎵嬫寚');return;}
  G_cheats.godMode = !G_cheats.godMode;
  showToast(G_cheats.godMode ? '馃洝锔?鏃犳晫妯″紡宸插紑鍚? : '馃洝锔?鏃犳晫妯″紡宸插叧闂?);
}

function cheatOneHitKill(){
  if(!G_cheats.enabled){showToast('璇峰厛寮€鍚噾鎵嬫寚');return;}
  G_cheats.oneHitKill = !G_cheats.oneHitKill;
  showToast(G_cheats.oneHitKill ? '鈿旓笍 涓€鍑诲繀鏉€宸插紑鍚? : '鈿旓笍 涓€鍑诲繀鏉€宸插叧闂?);
}

function cheatInfiniteMP(){
  if(!G_cheats.enabled){showToast('璇峰厛寮€鍚噾鎵嬫寚');return;}
  G_cheats.infiniteMP = !G_cheats.infiniteMP;
  showToast(G_cheats.infiniteMP ? '馃敭 鏃犻檺钃濋噺宸插紑鍚? : '馃敭 鏃犻檺钃濋噺宸插叧闂?);
}

function cheatForceMutation(){
  if(!G_cheats.enabled){showToast('璇峰厛寮€鍚噾鎵嬫寚');return;}
  G_cheats.forceMutation = !G_cheats.forceMutation;
  showToast(G_cheats.forceMutation ? '鈽ｏ笍 寮哄埗寮傚彉宸插紑鍚紙涓嬫铻嶅悎蹇呭嚭寮傚彉锛? : '鈽ｏ笍 寮哄埗寮傚彉宸插叧闂?);
}

function cheatShowMergeResult(){
  if(!G_cheats.enabled){showToast('璇峰厛寮€鍚噾鎵嬫寚');return;}
  G_cheats.showMergeResult = !G_cheats.showMergeResult;
  showToast(G_cheats.showMergeResult ? '馃敭 鍚堟垚缁撴灉棰勮宸插紑鍚? : '馃敭 鍚堟垚缁撴灉棰勮宸插叧闂?);
  // 鍒锋柊鍚堟垚椤甸潰浠ユ洿鏂版樉绀?  if(document.getElementById('merge-result')){
    updateMergeUI();
  }
}

function cheatSkipStage(){
  if(!G_cheats.enabled){showToast('璇峰厛寮€鍚噾鎵嬫寚');return;}
  G.stageProgress++;
  showToast('鈴笍 宸茶烦杩囧綋鍓嶅叧鍗?);
}

function cheatUnlockAll(){
  if(!G_cheats.enabled){showToast('璇峰厛寮€鍚噾鎵嬫寚');return;}
  // 瑙ｉ攣鎵€鏈夎嫳闆勬ā鏉?  HERO_TEMPLATES.forEach(function(tpl){
    if(!G.heroes.some(function(h){return h.templateId===tpl.id})){
      G.heroes.push(createHero(tpl.id, 1));
    }
  });
  showToast('馃敁 宸茶В閿佹墍鏈夎嫳闆?);
}

function updateCheatPanel(){
  var panel = document.getElementById('cheat-panel');
  if(panel){
    panel.style.display = G_cheats.enabled ? 'block' : 'none';
  }
}

// ==================== 鍒濆鍖?====================
function initGame(){
  // 灏濊瘯璇绘。
  if(loadGame()){
    updateResUI();
    startAutoProduction();
    switchTab('town');
    showToast('馃搨 宸茶鍙栧瓨妗?);
    return;
  }
  
  // 缁欑帺瀹跺垵濮嬭嫳闆?  const starter1=createHero('swordsman',1);
  const starter2=createHero('squire',1);
  const starter3=createHero('apprentice',1);
  const starter4=createHero('herbalist',1);
  G.heroes.push(starter1,starter2,starter3,starter4);
  G.team[0]=starter1;
  G.team[1]=starter2;
  G.team[2]=starter3;
  G.team[3]=starter4;

  // 鍒濆瑁呭
  G.equipment.push(createEquipment('rusty_sword'));
  G.equipment.push(createEquipment('wooden_shield'));
  G.equipment.push(createEquipment('leather_armor'));
  G.equipment.push(createEquipment('magic_ring'));

  updateResUI();
  G.stageProgress=1;
  startAutoProduction();
  switchTab('town');
}

// 瀵艰埅浜嬩欢
document.querySelectorAll('.nav-btn').forEach(btn=>{
  btn.addEventListener('click',()=>switchTab(btn.dataset.tab));
});

// 鍚姩娓告垙
initGame();

// H5鐙珛妯″紡闅愯棌閲戞墜鎸囨寜閽?if(G_isH5Package){
  var cheatBtn=document.getElementById('nav-cheats-btn');
  if(cheatBtn)cheatBtn.style.display='none';
}

// 鑷姩鎴樻枟娴嬭瘯鍏ュ彛
if(window.location.hash==='#autobattle'){setTimeout(function(){startBattle(1)},800)}
