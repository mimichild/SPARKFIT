import type { DerivedMeasurement } from '@/utils/bodyMetrics';

export type HomeMetricKey = keyof Omit<DerivedMeasurement, 'date'>;

export type HomeMetric = {
  key: HomeMetricKey;
  label: string;
  unit: string;
  decimals?: number;
};

/** 首頁「身體組成」區塊顯示的項目與順序。 */
export const HOME_COMPOSITION_METRICS: HomeMetric[] = [
  { key: 'skeletal_muscle',    label: '骨骼肌量',     unit: 'kg'   },
  { key: 'body_fat_rate',      label: '體脂率',       unit: '%'    },
  { key: 'visceral_fat',       label: '內臟脂肪等級', unit: ''     },
  { key: 'waist_hip_ratio',    label: '腰臀比',       unit: '', decimals: 2 },
  { key: 'waist_height_ratio', label: '腰高比',       unit: '', decimals: 2 },
  { key: 'body_fat_weight',    label: '體脂肪量',     unit: 'kg'   },
  { key: 'lean_mass',          label: '去脂體重',     unit: 'kg'   },
  { key: 'bmr',                label: '基礎代謝率',   unit: 'kcal' },
  { key: 'bmi',                label: 'BMI',          unit: ''     },
  { key: 'ffmi',               label: 'FFMI',         unit: ''     },
];

/** 首頁「身體尺寸」區塊顯示的項目與順序。 */
export const HOME_SIZE_METRICS: HomeMetric[] = [
  { key: 'chest',     label: '胸圍',   unit: 'cm' },
  { key: 'underbust', label: '下胸圍', unit: 'cm' },
  { key: 'waist',     label: '腰圍',   unit: 'cm' },
  { key: 'low_waist', label: '低腰圍', unit: 'cm' },
  { key: 'hip',       label: '臀圍',   unit: 'cm' },
  { key: 'thigh',     label: '大腿圍', unit: 'cm' },
  { key: 'calf',      label: '小腿圍', unit: 'cm' },
  { key: 'arm',       label: '手臂圍', unit: 'cm' },
];

/** 首頁 (?) 點開後的說明。參考範圍僅供一般參考，不同體脂計與個人狀況會有差異。 */
export const METRIC_INFO: Record<string, { title: string; description: string }> = {
  weight: {
    title: '體重',
    description: '身體的總重量。每天會因為水分、飲食、排便而上下波動 0.5～1 公斤，建議固定在早上起床、如廁後量，看一段時間的趨勢比看單日數字更有意義。',
  },
  skeletal_muscle: {
    title: '骨骼肌量',
    description: '附著在骨骼上、能主動出力的肌肉重量。骨骼肌越多，基礎代謝越高、身形也越緊實。減重時的目標是「體脂肪量下降、骨骼肌量維持或上升」，代表瘦掉的是脂肪而不是肌肉。',
  },
  body_fat_rate: {
    title: '體脂率',
    description: '脂肪佔體重的百分比。比體重更能反映身材胖瘦，一般成年女性約 20～30%、男性約 10～20% 屬於常見範圍。不同體脂計量法不同，建議用同一台機器看變化趨勢。',
  },
  visceral_fat: {
    title: '內臟脂肪等級',
    description: '包覆在內臟周圍的脂肪多寡，跟代謝症候群、心血管疾病風險關係密切，外表不一定看得出來。標準依體脂計品牌不同，常見以 1～9（部分品牌 1～12）為標準，超過就算偏高，建議透過飲食與運動降低。',
  },
  waist_hip_ratio: {
    title: '腰臀比',
    description: '腰圍 ÷ 臀圍，反映脂肪分布在腹部還是臀腿。數字越高代表脂肪越集中在腹部，健康風險越高；世界衛生組織以女性 ≥ 0.85、男性 ≥ 0.90 為腹部肥胖。沒手填時由腰圍與臀圍自動計算。',
  },
  waist_height_ratio: {
    title: '腰高比',
    description: '腰圍 ÷ 身高，自動計算。是判斷腹部肥胖簡單又準確的指標，原則是「腰圍不要超過身高的一半」：小於 0.5 屬理想，0.5 以上代表腹部脂肪偏多。',
  },
  body_fat_weight: {
    title: '體脂肪量',
    description: '身體裡脂肪的實際重量（公斤），約等於體重 × 體脂率。減重時最該下降的就是這個數字；若體重沒變但體脂肪量下降，代表身體組成正在變好。',
  },
  lean_mass: {
    title: '去脂體重',
    description: '體重扣掉脂肪後的重量，包含肌肉、骨骼、水分與器官，由「體重 − 體脂肪量」自動計算（沒填體脂肪量時改用體脂率推算）。減重期間希望它盡量維持，下降太多可能代表流失了肌肉。',
  },
  bmr: {
    title: '基礎代謝率',
    description: '身體完全靜止一整天、維持呼吸心跳等基本運作所需的最低熱量（大卡）。肌肉越多通常越高。長期吃得比基礎代謝還少，容易掉肌肉、代謝變慢，減重反而更困難。',
  },
  bmi: {
    title: 'BMI',
    description: '身體質量指數，體重(kg) ÷ 身高(m)²，由身高與體重自動計算。衛福部建議成人 18.5～24 為正常、24～27 過重、27 以上肥胖。BMI 分不出肌肉和脂肪，肌肉多的人可能偏高，建議搭配體脂率一起看。',
  },
  ffmi: {
    title: 'FFMI',
    description: '去脂體重指數，去脂體重(kg) ÷ 身高(m)²，自動計算。可以排除身高差異比較肌肉量多寡，一般女性約 14～17、男性約 17～20。減重時 FFMI 維持不掉，代表瘦下來的主要是脂肪。',
  },
  chest: {
    title: '胸圍',
    description: '經過胸部最高點水平繞一圈的長度。是挑選上衣、洋裝尺寸的依據；搭配下胸圍可以推算內衣罩杯。',
  },
  underbust: {
    title: '下胸圍',
    description: '貼著胸部下緣水平繞一圈的長度，決定內衣的底圍尺寸。胸圍與下胸圍相差越多，罩杯越大；減重時下胸圍通常會跟著變小，可作為換內衣尺寸的參考。',
  },
  waist: {
    title: '腰圍',
    description: '腰部水平繞一圈的長度，是判斷腹部肥胖最直接的指標。衛福部標準為女性 ≥ 80 公分、男性 ≥ 90 公分屬腹部肥胖。也會用來計算腰臀比與腰高比。',
  },
  low_waist: {
    title: '低腰圍',
    description: '肚臍下方、約低腰褲褲頭位置繞一圈的長度。可以看出小腹的變化，也是挑選低腰褲、裙子尺寸的依據。',
  },
  hip: {
    title: '臀圍',
    description: '臀部最突出處水平繞一圈的長度。是挑選褲子、裙子尺寸的重要依據，也會用來計算腰臀比。',
  },
  thigh: {
    title: '大腿圍',
    description: '大腿最粗處（約臀部下方）繞一圈的長度。可以追蹤下半身線條變化，也影響褲子穿起來是否合身。',
  },
  calf: {
    title: '小腿圍',
    description: '小腿最粗處繞一圈的長度。可以追蹤腿部線條變化；久站、久坐造成的水腫也會讓數字變大，建議固定在早上量比較準。',
  },
  arm: {
    title: '手臂圍',
    description: '上臂最粗處繞一圈的長度。可以追蹤蝴蝶袖、上半身線條變化，也影響上衣袖口是否合身。',
  },
};
