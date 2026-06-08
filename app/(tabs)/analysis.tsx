import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ScrollView } from 'react-native-gesture-handler';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { useSettingsStore } from '@/stores/settingsStore';
import { useMeasurements, type Measurement } from '@/hooks/useMeasurements';
import { Colors } from '@/constants/colors';

// ── Types ─────────────────────────────────────────────────────────

type BodyType = '沙漏型' | '梨型' | '蘋果型' | '倒三角型' | '直筒型';

const DISPLAY_NAME: Record<BodyType, string> = {
  沙漏型:  '沙漏型身材（X型）',
  梨型:    '梨型身材（A型）',
  蘋果型:  '蘋果型身材（O型）',
  倒三角型: '倒三角型身材（V型）',
  直筒型:  '直筒型身材（H型）',
};

type BodyTypeData = {
  emoji: string;
  shortDesc: string;
  fullDesc: string;
  traits: string[];
  outfits: string[];
  outfitNote: string;
  avoid: string[];
  avoidNote: string;
};

// ── Body type content ─────────────────────────────────────────────

const BODY_DATA: Record<BodyType, BodyTypeData> = {
  沙漏型: {
    emoji: '⌛',
    shortDesc: '胸圍與臀圍相近，腰部纖細，曲線均衡',
    fullDesc:
      '沙漏型是許多人夢寐以求的體型，特點是胸圍與臀圍比例相近（差距通常在 5 cm 以內），而腰部明顯纖細，整體形成優美的 S 型曲線。這種體型在視覺上呈現完美的對稱感，上下半身均衡且腰線自然突出。\n\n沙漏型在穿衣時優勢明顯，幾乎所有款式都能輕鬆駕馭。最重要的穿搭原則是「展現並強調腰線」，避免用寬鬆的剪裁遮蓋最美的比例優勢。無論是合身洋裝、高腰設計或是腰帶點綴，都能讓你的曲線更加迷人。',
    traits: [
      '胸圍與臀圍比例相近，上下均衡',
      '腰部明顯纖細，腰胸比與腰臀比皆 ≤ 0.75',
      '曲線感強，輪廓呈現優美的 S 形',
      '肩膀寬度與臀部相近，視覺比例協調',
    ],
    outfitNote: '展現曲線是你的最大優勢，以下穿搭都能讓你的比例更加突出：',
    outfits: [
      '合身洋裝或包臀裙：直接展現腰臀曲線，是最能突顯體型的選擇',
      '高腰設計的褲裙：強調腰線，讓腿部視覺上更修長',
      '腰帶或綁帶：在任何服裝上加一條腰帶，都能進一步收腰強調比例',
      'V 領或深領口：拉長頸部視覺，讓整體更顯優雅大方',
      '貼身針織上衣搭配 A 字裙：展現上半身線條同時維持下半身的優雅感',
      '修身西裝外套：正式場合的最佳選擇，展現幹練又有曲線的形象',
    ],
    avoidNote: '以下款式容易遮蓋你的曲線優勢，建議少碰：',
    avoid: [
      '過度寬鬆的 oversized 款式：雖然流行，但容易完全遮蓋最美的腰線曲線',
      '厚重多層次的面料：使輪廓顯得臃腫，視覺上失去曲線感',
      '無腰線的直筒洋裝：破壞比例感，讓整體輪廓顯得平板',
      '過長的上衣 hem line 落在臀部最寬處：強調臀部而非腰部',
    ],
  },
  梨型: {
    emoji: '🍐',
    shortDesc: '臀圍明顯大於胸圍，下半身豐滿',
    fullDesc:
      '梨型（又稱 A 字型）是東亞女性中最常見的體型之一，特徵是臀部和大腿相對豐滿，胸部和肩膀較窄，整體輪廓上窄下寬，如同一顆梨子的形狀。\n\n梨型體型的優勢在於擁有明顯的腰線與圓潤的臀部曲線，十分具有女性魅力。穿搭時的核心策略是「平衡視覺比例」——將視覺焦點移往上半身，讓肩膀在視覺上顯得更寬，同時用合適的剪裁修飾下半身線條，創造出更均衡的整體比例感。',
    traits: [
      '臀圍比胸圍寬 5 cm 以上，下半身較豐滿',
      '肩膀相對較窄，上半身偏纖細',
      '腰線存在但位置偏下，腰臀比通常 < 0.75',
      '大腿與臀部曲線圓潤，腿部較粗壯',
    ],
    outfitNote: '把視覺焦點拉到上半身，同時修飾下半身線條：',
    outfits: [
      'A 字裙或蓬蓬裙：從臀部到膝蓋逐漸展開，自然修飾臀腿輪廓',
      '深色系下半身穿搭：黑色、深藍、深咖等深色有視覺收縮效果',
      '肩部有細節的上衣：荷葉邊、蓬袖、刺繡、印花等設計，讓肩部更有份量感',
      '寬肩設計外套或西裝：擴充上半身視覺，平衡上下比例',
      '高腰寬褲或直筒褲：高腰強調腰線，寬版設計遮蓋大腿讓比例更均衡',
      '長版外套或風衣：垂落至大腿中段，修飾整體下半身線條',
      '冷肩設計或露肩上衣：增加肩部視覺寬度，讓上半身顯得更有存在感',
    ],
    avoidNote: '以下款式容易強調下半身，使視覺比例更不均衡：',
    avoid: [
      '緊身牛仔褲或窄版褲：直接貼合腿部輪廓，強調大腿與臀部寬度',
      '下半身橫條紋圖案：橫條紋有視覺放大效果，穿在下半身更顯寬',
      '過短的上衣（露腰）：讓視覺重心完全落在下半身，比例感失衡',
      '低腰設計：強調臀部位置，視覺上讓臀部更顯突出',
      '下半身亮色、大印花：讓視線集中在豐滿的下半身部位',
      '窄裙或鉛筆裙：緊貼臀腿，讓豐滿感更加明顯',
    ],
  },
  蘋果型: {
    emoji: '🍎',
    shortDesc: '體重集中腹部腰間，腰圍較寬',
    fullDesc:
      '蘋果型（又稱圓形體型或 O 型）的特徵是體重和脂肪較集中於腹部和腰間，腰線不明顯，而腿部和手臂通常相對纖細修長。整體輪廓較為圓潤飽滿，肩膀偏寬。\n\n蘋果型的穿搭策略主要是「轉移視線」——利用視覺技巧將注意力引導至臉部、肩膀、腿部等優勢部位，同時用合適的剪裁遮蓋腰腹部位。切記要選擇有垂墜感的面料，讓衣物自然流線而非緊貼腹部。展現修長的腿部和優美的鎖骨頸部，是蘋果型的最大穿搭利器。',
    traits: [
      '腹部豐滿，腰線不明顯，腰圍與胸臀差距小',
      '腿部與手臂相對修長纖細',
      '肩膀偏寬，鎖骨線條通常明顯',
      '胸部通常較豐滿',
    ],
    outfitNote: '轉移視線、遮蓋腰腹、展現優勢腿部是關鍵：',
    outfits: [
      '帝國腰線（高腰線）洋裝：腰線提高至胸部下方，完全跳過腹部',
      'A 字裙或直筒裙：從腰部以下自然展開，不強調腹部曲線',
      'V 領或深 V 領口：引導視線往上，展現鎖骨頸部，同時有拉長效果',
      '垂墜感面料的上衣：自然流線不貼身，遮蓋腹部同時顯得優雅',
      '長版外套搭配修身褲：展現修長腿部，同時外套遮蓋腰腹',
      '深色系整體穿搭加垂直線條：深色有收縮感，垂直線條拉長視覺比例',
      '寬鬆上衣搭配修身褲或短裙：上寬下窄，視覺重心在修長的下半身',
    ],
    avoidNote: '以下款式容易強調腰腹，讓比例感更不理想：',
    avoid: [
      '緊身上衣或貼身材質：直接突顯腹部輪廓，效果適得其反',
      '腰帶束腰（在最粗的地方綁帶）：強調腰圍的最寬部分',
      '低腰設計或短版上衣搭配低腰褲：露出腹部，視覺上讓腰腹最寬',
      '水平橫條紋圖案：尤其在上衣位置，有放大腹部視覺的效果',
      '過於蓬鬆的上衣加寬褲：整體輪廓過於膨脹，缺乏線條感',
      '腰部有大量拼接或裝飾設計：視線聚焦在腰腹部位',
    ],
  },
  倒三角型: {
    emoji: '🔺',
    shortDesc: '肩膀或胸部寬，腰臀相對較窄',
    fullDesc:
      '倒三角型（又稱 V 字型）的特徵是肩膀寬闊或胸部較寬，而腰部和臀部相對較窄，整體呈現上寬下窄的輪廓，如同一個倒置的三角形。這種體型通常顯得運動感十足，充滿健康活力的氣息，是許多運動員常見的體型。\n\n穿搭的核心策略是「增加下半身份量，柔化肩部線條」。透過讓下半身視覺上更有份量，能讓整體的寬窄比例趨於平衡，讓整體看起來更加協調。同時，領口的選擇也很關鍵——避免加寬肩部視覺的設計，改用能柔化肩線的款式。',
    traits: [
      '肩膀寬且結實，或胸圍明顯大於臀圍（差距 5 cm 以上）',
      '臀部與腿部相對纖細，下半身較窄',
      '腰線存在，但下半身視覺分量較輕',
      '整體運動感強，充滿活力',
    ],
    outfitNote: '增加下半身份量，平衡上下比例：',
    outfits: [
      'A 字裙或蓬蓬圓裙：增加下半身視覺份量，平衡寬肩效果',
      '喇叭褲或寬褲：讓腿部輪廓更豐富，視覺上平衡上半身',
      '有細節的下半身設計：口袋、刺繡、印花、拼接等，讓視線移往下方',
      '細肩帶或深 V 領：縮減肩部視覺，讓頸肩線條顯得更柔和',
      '腰帶搭配蓬裙：創造腰臀的視覺比例，讓下半身更有曲線感',
      '針織寬褲或布料豐厚的裙裝：增加下半身視覺重量',
      '低領口或交叉領：引導視線往胸前，柔化肩部的銳利線條',
    ],
    avoidNote: '以下款式容易讓肩膀更顯寬，比例失衡：',
    avoid: [
      '肩部有蓬袖、荷葉邊或墊肩設計：直接增加肩膀視覺寬度',
      '水平橫條紋上衣：橫條紋在上半身位置，視覺上讓肩胸更顯寬大',
      '緊身直筒下裝：上寬下窄的對比更加明顯，比例感更失衡',
      '船領或一字領：這種領型會讓視線直接水平掃過肩部，加寬效果明顯',
      '有大量上半身裝飾的上衣：口袋、印花、細節集中在上半身，視覺更重',
      '窄版背心或細肩帶款搭配寬肩外套：外套肩線太寬則效果適得其反',
    ],
  },
  直筒型: {
    emoji: '📏',
    shortDesc: '三圍比例相近，腰線不明顯',
    fullDesc:
      '直筒型（又稱 H 型或長方形體型）的特徵是胸圍、腰圍、臀圍三圍比例相近，整體輪廓較為平直，腰線不明顯，沒有強烈的上下起伏曲線。乍看之下可能以為穿搭有限制，但實際上這種體型的穿搭自由度非常高！\n\n正因為沒有過於強烈的曲線，直筒型可以輕鬆嘗試各種風格，從簡約極簡到層次豐富的搭配都能駕馭。穿搭策略的核心是「製造視覺曲線」——透過腰帶、高腰設計、蓬裙等元素人工創造視覺腰線，或者乾脆擁抱平直線條，打造時尚的中性風或俐落帥氣的形象。',
    traits: [
      '胸圍、腰圍、臀圍差距不大，三圍比例均衡',
      '腰線不明顯，整體線條較平直',
      '穿搭自由度高，幾乎所有廓形都能嘗試',
      '特別適合中性風、帥氣風、極簡風格',
    ],
    outfitNote: '製造視覺曲線或擁抱直線條美學，兩種路線都適合你：',
    outfits: [
      '腰帶或綁帶設計：在任何服裝上加腰帶，立刻人工創造腰線，效果顯著',
      '多層次穿搭（layering）：不同長度的上衣、外套疊搭，增加視覺豐富感',
      '不對稱剪裁：一邊長一邊短、斜向拼接，製造視覺動態感',
      '高腰設計搭配蓬裙：高腰強調腰線，蓬裙增加臀部視覺份量',
      '印花或色塊拼接設計：豐富視覺層次，讓整體造型更有看點',
      '中性風格搭配：西裝褲、挺版外套、oversized 上衣，展現帥氣俐落的一面',
      '腰綁帶洋裝：兼具展示腰線與遮蓋比例的效果',
    ],
    avoidNote: '以下款式容易讓直筒感更明顯，少了層次與變化：',
    avoid: [
      '全身同色系且無剪裁變化的穿搭：單一色調加上直線條，整體顯得過於單調',
      '過度寬鬆的大廓形全套搭配：若上下都是寬鬆款，整體輪廓完全隱沒',
      '過於樸素無細節的直線條剪裁：強調平直感而缺乏亮點，視覺效果平板',
      '過長的直筒裙搭配素面上衣：整體輪廓成一個完整的長方形，比例感差',
    ],
  },
};

// ── Formula builder ───────────────────────────────────────────────

type FormulaResult = { lines: string[]; bodyType: BodyType };

function buildFormula(
  chest: number,
  waist: number,
  hip: number,
  shoulder?: number | null,
): FormulaResult {
  const lines: string[] = [];

  if (shoulder != null) {
    const diff = +(shoulder - hip).toFixed(1);
    lines.push(`肩寬（${shoulder}）− 臀圍（${hip}）= ${diff} cm`);
    if (diff > 4) {
      lines.push(`差值 ${diff} cm > 4 cm　→ 上半身明顯寬於下半身`);
      return { lines, bodyType: '倒三角型' };
    }
    lines.push(`差值 ${diff} cm ≤ 4 cm　→ 肩臀尚屬均衡，繼續比對胸臀差`);
  }

  const bustHipDiff = +(chest - hip).toFixed(1);
  const hipBustDiff = +(hip - chest).toFixed(1);
  lines.push(`胸圍（${chest}）− 臀圍（${hip}）= ${bustHipDiff} cm`);

  if (bustHipDiff > 5) {
    lines.push(`差值 ${bustHipDiff} cm > 5 cm　→ 胸部寬於臀部`);
    return { lines, bodyType: '倒三角型' };
  }
  if (hipBustDiff > 5) {
    lines.push(`差值 ${hipBustDiff} cm > 5 cm　→ 臀部寬於胸部（下半身較豐滿）`);
    const whr = +(waist / hip).toFixed(2);
    lines.push(`腰臀比　腰圍（${waist}）÷ 臀圍（${hip}）= ${whr}`);
    return { lines, bodyType: '梨型' };
  }

  lines.push(`胸臀差距 ${Math.abs(bustHipDiff)} cm ≤ 5 cm　→ 上下半身均衡，比對腰部比例`);
  const waistMax = Math.max(chest, hip);
  const waistRatio = +(waist / waistMax).toFixed(2);
  lines.push(`腰圍（${waist}）÷ 最大值（胸${chest}、臀${hip}）= ${waistRatio}`);

  if (waistRatio > 0.82) {
    lines.push(`比值 ${waistRatio} > 0.82　→ 腰部相對較寬，無明顯收腰`);
    return { lines, bodyType: '蘋果型' };
  }

  const wcr = +(waist / chest).toFixed(2);
  const whr = +(waist / hip).toFixed(2);
  lines.push(`腰胸比　${waist} ÷ ${chest} = ${wcr}`);
  lines.push(`腰臀比　${waist} ÷ ${hip} = ${whr}`);

  if (wcr <= 0.75 && whr <= 0.75) {
    lines.push(`腰胸比 ${wcr} ≤ 0.75 且腰臀比 ${whr} ≤ 0.75　→ 腰部明顯纖細，曲線均衡`);
    return { lines, bodyType: '沙漏型' };
  }

  lines.push(`比值未達沙漏型標準（需 ≤ 0.75），三圍比例相近　→ 整體輪廓平直`);
  return { lines, bodyType: '直筒型' };
}

// ── Sub components ────────────────────────────────────────────────

function BulletList({ items, color }: { items: string[]; color: string }) {
  return (
    <View style={{ gap: 10 }}>
      {items.map((item, i) => (
        <View key={i} style={styles.bulletRow}>
          <View style={[styles.bullet, { backgroundColor: color }]} />
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function CollapsibleBodyCard({
  bodyType,
  isUser,
  themeColor,
}: {
  bodyType: BodyType;
  isUser: boolean;
  themeColor: string;
}) {
  const [open, setOpen] = useState(isUser);
  const d = BODY_DATA[bodyType];

  return (
    <View style={[styles.bodyCard, isUser && { borderColor: themeColor, borderWidth: 2 }]}>
      <TouchableOpacity
        style={styles.bodyCardHeader}
        onPress={() => setOpen(o => !o)}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
          <Text style={styles.bodyCardEmoji}>{d.emoji}</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[styles.bodyCardName, isUser && { color: themeColor }]}>{DISPLAY_NAME[bodyType]}</Text>
              {isUser && (
                <View style={[styles.youBadge, { backgroundColor: themeColor }]}>
                  <Text style={styles.youBadgeText}>你的體型</Text>
                </View>
              )}
            </View>
            <Text style={styles.bodyCardShortDesc} numberOfLines={1}>{d.shortDesc}</Text>
          </View>
        </View>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={Colors.textSecondary}
        />
      </TouchableOpacity>

      {open && (
        <View style={styles.bodyCardBody}>
          <Text style={styles.bodyCardFullDesc}>{d.fullDesc}</Text>

          <Text style={styles.subLabel}>體型特徵</Text>
          <BulletList items={d.traits} color={isUser ? themeColor : Colors.textSecondary} />

          <View style={styles.divider} />
          <Text style={[styles.subLabel, { color: isUser ? themeColor : Colors.textPrimary }]}>
            穿搭建議
          </Text>
          <Text style={styles.noteText}>{d.outfitNote}</Text>
          <BulletList items={d.outfits} color={isUser ? themeColor : Colors.textSecondary} />

          <View style={styles.divider} />
          <Text style={[styles.subLabel, { color: '#FF7A7A' }]}>避雷建議</Text>
          <Text style={styles.noteText}>{d.avoidNote}</Text>
          <BulletList items={d.avoid} color="#FF7A7A" />
        </View>
      )}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────

const ALL_TYPES: BodyType[] = ['沙漏型', '梨型', '蘋果型', '倒三角型', '直筒型'];

export default function AnalysisScreen() {
  const themeColor = useSettingsStore(s => s.themeColor);
  const shoulderWidth = useSettingsStore(s => s.shoulderWidth);

  const { getLatestMeasurement } = useMeasurements();
  const [latest, setLatest] = useState<Measurement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoaded(false);
      getLatestMeasurement().then(m => { setLatest(m); setLoaded(true); });
    }, [getLatestMeasurement]),
  );

  const canAnalyze = !!(latest?.chest && latest?.waist && latest?.hip);

  const formula = canAnalyze
    ? buildFormula(latest!.chest!, latest!.waist!, latest!.hip!, shoulderWidth)
    : null;

  const userType = formula?.bodyType ?? null;
  const otherTypes = userType ? ALL_TYPES.filter(t => t !== userType) : ALL_TYPES;

  return (
    <View style={{ flex: 1 }}>
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Text style={[styles.appTitle, { color: themeColor }]}>SPARKFIT</Text>
        <Text style={styles.pageTitle}>分析</Text>

        {/* ── Measurements Card ── */}
        <View style={styles.measureCard}>
          <Text style={styles.measureCardTitle}>你的身材數據</Text>
          <View style={styles.measureRow}>
            {[
              { label: '肩寬', value: shoulderWidth, unit: 'cm' },
              { label: '胸圍', value: latest?.chest, unit: 'cm' },
              { label: '腰圍', value: latest?.waist, unit: 'cm' },
              { label: '臀圍', value: latest?.hip, unit: 'cm' },
            ].map(({ label, value, unit }) => (
              <View key={label} style={styles.measureCell}>
                <Text style={styles.measureLabel}>{label}</Text>
                <Text style={[styles.measureValue, { color: value != null ? themeColor : Colors.border }]}>
                  {value != null ? value.toFixed(1) : '──'}
                </Text>
                <Text style={styles.measureUnit}>{unit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── No data state ── */}
        {loaded && !canAnalyze && (
          <View style={styles.emptyCard}>
            <Ionicons name="body-outline" size={44} color={Colors.border} />
            <Text style={styles.emptyTitle}>尚無足夠資料</Text>
            <Text style={styles.emptyDesc}>
              請先在「數據」頁填寫{'\n'}
              <Text style={{ fontWeight: '700' }}>胸圍、腰圍、臀圍</Text>
              {'\n'}以啟用體型分析
            </Text>
          </View>
        )}

        {canAnalyze && formula && userType && (
          <>
            {/* ── Body type declaration ── */}
            <View style={[styles.declarationCard, { borderLeftColor: themeColor }]}>
              <Text style={styles.declarationText}>
                依據您的身材數據，你屬於：
              </Text>
              <Text style={[styles.declarationResult, { color: themeColor }]}>
                {BODY_DATA[userType].emoji}　{DISPLAY_NAME[userType]}
              </Text>
            </View>

            {/* ── Formula card ── */}
            <View style={styles.formulaCard}>
              <View style={styles.formulaHeader}>
                <Ionicons name="calculator-outline" size={16} color={themeColor} />
                <Text style={[styles.formulaTitle, { color: themeColor }]}>判斷算式</Text>
              </View>
              {formula.lines.map((line, i) => (
                <View key={i} style={styles.formulaRow}>
                  <Text style={styles.formulaIndex}>{i + 1}</Text>
                  <Text style={styles.formulaLine}>{line}</Text>
                </View>
              ))}
              <View style={[styles.formulaConclusion, { backgroundColor: themeColor + '18' }]}>
                <Text style={[styles.formulaConclusionText, { color: themeColor }]}>
                  ∴ 判定結果：{DISPLAY_NAME[userType]}
                </Text>
              </View>
            </View>

            {/* ── Body type cards ── */}
            <Text style={styles.sectionGroupTitle}>體型詳細說明</Text>

            {/* User's type first */}
            <CollapsibleBodyCard bodyType={userType} isUser themeColor={themeColor} />

            {/* Reference */}
            <Text style={styles.referenceLabel}>其他體型參考</Text>
            {otherTypes.map(t => (
              <CollapsibleBodyCard key={t} bodyType={t} isUser={false} themeColor={themeColor} />
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingTop: 12 },

  appTitle: { fontSize: 22, fontWeight: '800', letterSpacing: 2 },
  pageTitle: { fontSize: 15, color: Colors.textSecondary, marginTop: 2, marginBottom: 20 },

  // Measurements card
  measureCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  measureCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  measureRow: { flexDirection: 'row', justifyContent: 'space-between' },
  measureCell: { alignItems: 'center', flex: 1 },
  measureLabel: { fontSize: 11, color: Colors.textSecondary, marginBottom: 4 },
  measureValue: { fontSize: 20, fontWeight: '800' },
  measureUnit: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },

  // Empty
  emptyCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 18,
    padding: 36,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  emptyDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  // Declaration
  declarationCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  declarationText: { fontSize: 14, color: Colors.textSecondary, marginBottom: 6 },
  declarationResult: { fontSize: 26, fontWeight: '800', letterSpacing: 1 },

  // Formula
  formulaCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formulaHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  formulaTitle: { fontSize: 13, fontWeight: '700' },
  formulaRow: { flexDirection: 'row', gap: 8, marginBottom: 6, alignItems: 'flex-start' },
  formulaIndex: {
    fontSize: 10,
    color: Colors.textSecondary,
    width: 16,
    marginTop: 2,
    textAlign: 'right',
  },
  formulaLine: { fontSize: 13, color: Colors.textPrimary, flex: 1, lineHeight: 20 },
  formulaConclusion: {
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  formulaConclusionText: { fontSize: 14, fontWeight: '700' },

  // Group / reference labels
  sectionGroupTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  referenceLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 10,
  },

  // Body type card
  bodyCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  bodyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 4,
  },
  bodyCardEmoji: { fontSize: 32 },
  bodyCardName: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  bodyCardShortDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  youBadge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  youBadgeText: { fontSize: 10, color: '#FFFFFF', fontWeight: '700' },
  bodyCardBody: { paddingHorizontal: 16, paddingBottom: 18 },
  bodyCardFullDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },

  // Sub sections
  subLabel: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8, marginTop: 4 },
  noteText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginBottom: 10 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 14 },

  // Bullets
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bullet: { width: 7, height: 7, borderRadius: 4, marginTop: 7, flexShrink: 0 },
  bulletText: { flex: 1, fontSize: 13, color: Colors.textPrimary, lineHeight: 22 },
});
