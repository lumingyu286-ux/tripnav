/* ===========================================================
   只需要改这一个文件。

   分类格式：[分类名, 角标, [条目...]]
   条目格式：[名称, 网址, 说明]
             [名称, 网址, 说明, 'adult']  ← 第四项加 'adult'
                                            点击时会先弹年龄确认

   顺序即显示顺序，第一个分类默认展开。成人百科排第一位。

   用 var 不用 const：app.js 通篇是 ES5 写法。这里若用 const，
   老引擎直接解析失败，会被报成「sites.js 被拦截了」，把人往
   错误方向带。
   =========================================================== */

var SITE = {
  name: '出行导航',
  tagline: '订票、找住处、查签证，出门前要开的那些站',
  deployedOn: '',
};

var GROUPS = [

['成人内容', '18+', [
  ['成人内容百科', 'https://chengrenbaike.com', '性知识与两性健康百科，仅限成年人', 'adult'],
]],

['机票与航班', '✈', [
  ['Skyscanner',     'https://www.skyscanner.net',            '全球机票比价'],
  ['Google 航班',    'https://www.google.com/travel/flights', '按日期和价格找航线'],
  ['去哪儿',         'https://www.qunar.com',                 '国内机票与酒店'],
  ['飞猪',           'https://www.fliggy.com',                '机票、酒店与度假'],
  ['Flightradar24',  'https://www.flightradar24.com',         '实时航班位置与动态'],
]],

['火车与长途', '⇄', [
  ['铁路 12306', 'https://www.12306.cn',   '官方购票与余票查询'],
  ['高铁网',     'https://www.gaotie.cn',  '车次时刻表与线路'],
  ['中国铁路 95306', 'https://www.95306.cn', '货运与铁路服务'],
]],

['酒店与民宿', '▤', [
  ['Booking', 'https://www.booking.com', '全球酒店预订'],
  ['Agoda',   'https://www.agoda.com',   '亚洲酒店价格较优'],
  ['Airbnb',  'https://www.airbnb.cn',   '民宿与整租'],
  ['途家',    'https://www.tujia.com',   '国内民宿与公寓'],
]],

['攻略与点评', '◈', [
  ['马蜂窝',      'https://www.mafengwo.cn',    '游记、攻略与路线'],
  ['穷游',        'https://www.qyer.com',       '境外攻略与行程'],
  ['Tripadvisor', 'https://www.tripadvisor.cn', '景点与餐厅点评'],
  ['Lonely Planet', 'https://www.lonelyplanet.com', '目的地指南（英文）'],
]],

['地图与路线', '◎', [
  ['Google 地图',    'https://www.google.com/maps',     '境外导航与街景'],
  ['OpenStreetMap',  'https://www.openstreetmap.org',   '开放地图数据'],
  ['Citymapper',     'https://citymapper.com',          '城市公共交通换乘'],
  ['Windy',          'https://www.windy.com',           '风、雨与航空气象'],
]],

['签证与出入境', '✓', [
  ['国家移民管理局',   'https://www.nia.gov.cn',      '出入境证件办理与预约'],
  ['中国领事服务网',   'http://cs.mfa.gov.cn',        '签证、公证与海外求助'],
  ['中国签证申请服务中心', 'https://www.visaforchina.cn', '各国来华签证办理'],
]],

['换汇与时差', '◫', [
  ['XE Currency', 'https://www.xe.com', '实时汇率换算'],
  ['Wise',        'https://wise.com',   '跨境转账与多币种账户'],
  ['time.is',     'https://time.is',    '世界时间与时差'],
]],

['租车与用车', '⚙', [
  ['神州租车', 'https://www.zuche.com', '国内自驾租车'],
  ['一嗨租车', 'https://www.1hai.cn',   '国内租车与异地还车'],
  ['Hertz',    'https://www.hertz.com', '境外租车'],
]],

];
