import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useVocabularyStore = defineStore('vocabulary', () => {
  const units = ref([
    {
      id: 'space-exploration',
      name: '太空探索',
      description: '学习关于太空、行星和探索宇宙的词汇。',
      icon: '🚀',
      difficulty: 2,
      wordCount: 10
    },
    {
      id: 'science-lab',
      name: '科学实验室',
      description: '探索与科学实验和实验室设备相关的词汇。',
      icon: '🔬',
      difficulty: 3,
      wordCount: 10
    },
    {
      id: 'technology',
      name: '科技基础',
      description: '学习关于计算机、设备和技术的基本词汇。',
      icon: '💻',
      difficulty: 1,
      wordCount: 10
    },
    {
      id: 'mathematics',
      name: '数学术语',
      description: '掌握重要的数学词汇，提升你的问题解决能力。',
      icon: '🧮',
      difficulty: 3,
      wordCount: 10
    },
    {
      id: 'robotics',
      name: '机器人与人工智能',
      description: '学习关于机器人、人工智能和自动化的词汇。',
      icon: '🤖',
      difficulty: 4,
      wordCount: 10
    }
  ])

  const words = ref([
    // 太空探索单元的单词
    {
      id: 'space-1',
      word: 'Asteroid',
      zh: '小行星',
      pronunciation: '/ˈæstəˌrɔɪd/',
      meaning: 'A small rocky body orbiting the sun',
      exampleSentence: 'Scientists track asteroids to make sure they won\'t hit Earth.',
      exampleSentence_zh: '科学家们追踪小行星以确保它们不会撞击地球。',
      partOfSpeech: 'noun',
      unitId: 'space-exploration'
    },
    {
      id: 'space-2',
      word: 'Gravity',
      zh: '重力',
      pronunciation: '/ˈɡrævɪti/',
      meaning: 'The force that attracts objects toward one another',
      exampleSentence: 'The gravity of the moon is weaker than that of Earth.',
      exampleSentence_zh: '月球的重力比地球的弱。',
      partOfSpeech: 'noun',
      unitId: 'space-exploration'
    },
    {
      id: 'space-3',
      word: 'Galaxy',
      zh: '星系',
      pronunciation: '/ˈɡæləksi/',
      meaning: 'A system of millions or billions of stars',
      exampleSentence: 'Our solar system is part of the Milky Way galaxy.',
      exampleSentence_zh: '我们的太阳系是银河系的一部分。',
      partOfSpeech: 'noun',
      unitId: 'space-exploration'
    },
    {
      id: 'space-4',
      word: 'Comet',
      zh: '彗星',
      pronunciation: '/ˈkɑːmət/',
      meaning: 'A celestial object consisting of a nucleus of ice and dust',
      exampleSentence: 'The comet left a beautiful trail of light as it passed near Earth.',
      exampleSentence_zh: '当彗星经过地球附近时，留下了美丽的光尾。',
      partOfSpeech: 'noun',
      unitId: 'space-exploration'
    },
    {
      id: 'space-5',
      word: 'Nebula',
      zh: '星云',
      pronunciation: '/ˈnebjələ/',
      meaning: 'A cloud of gas and dust in outer space',
      exampleSentence: 'The telescope captured stunning images of the colorful nebula.',
      exampleSentence_zh: '望远镜捕捉到了色彩斑斓的星云的壮观图像。',
      partOfSpeech: 'noun',
      unitId: 'space-exploration'
    },
    {
      id: 'space-6',
      word: 'Spacecraft',
      zh: '航天器',
      pronunciation: '/ˈspeɪskræft/',
      meaning: 'A vehicle designed for travel or operation in outer space',
      exampleSentence: 'The spacecraft will travel to Mars with a crew of four astronauts.',
      exampleSentence_zh: '这艘航天器将搭载四名宇航员前往火星。',
      partOfSpeech: 'noun',
      unitId: 'space-exploration'
    },
    {
      id: 'space-7',
      word: 'Orbit',
      zh: '轨道',
      pronunciation: '/ˈɔːrbɪt/',
      meaning: 'The curved path of an object around a star, planet, or moon',
      exampleSentence: 'The satellite completes one orbit around Earth every 90 minutes.',
      exampleSentence_zh: '卫星每90分钟绕地球完成一次轨道运行。',
      partOfSpeech: 'noun',
      unitId: 'space-exploration'
    },
    {
      id: 'space-8',
      word: 'Telescope',
      zh: '望远镜',
      pronunciation: '/ˈtelɪskoʊp/',
      meaning: 'An optical instrument designed to make distant objects appear nearer',
      exampleSentence: 'The Hubble telescope has revolutionized our understanding of the universe.',
      exampleSentence_zh: '哈勃望远镜彻底改变了我们对宇宙的认识。',
      partOfSpeech: 'noun',
      unitId: 'space-exploration'
    },
    {
      id: 'space-9',
      word: 'Constellation',
      zh: '星座',
      pronunciation: '/ˌkɑːnstəˈleɪʃən/',
      meaning: 'A group of stars forming a recognizable pattern',
      exampleSentence: 'Orion is one of the most easily recognizable constellations in the night sky.',
      exampleSentence_zh: '猎户座是夜空中最容易辨认的星座之一。',
      partOfSpeech: 'noun',
      unitId: 'space-exploration'
    },
    {
      id: 'space-10',
      word: 'Astronaut',
      zh: '宇航员',
      pronunciation: '/ˈæstrənɔːt/',
      meaning: 'A person trained to travel in a spacecraft',
      exampleSentence: 'The astronaut spent six months aboard the International Space Station.',
      exampleSentence_zh: '这位宇航员在国际空间站上待了六个月。',
      partOfSpeech: 'noun',
      unitId: 'space-exploration'
    },
    
    // 科学实验室单元的单词
    {
      id: 'science-1',
      word: 'Experiment',
      zh: '实验',
      pronunciation: '/ɪkˈsperɪmənt/',
      meaning: 'A scientific procedure to test a hypothesis',
      exampleSentence: 'The scientist conducted an experiment to test the new medicine.',
      exampleSentence_zh: '科学家进行了一项实验来测试这种新药。',
      partOfSpeech: 'noun',
      unitId: 'science-lab'
    },
    {
      id: 'science-2',
      word: 'Laboratory',
      zh: '实验室',
      pronunciation: '/ˈlæbrəˌtɔri/',
      meaning: 'A place equipped for scientific research',
      exampleSentence: 'The new laboratory has state-of-the-art equipment.',
      exampleSentence_zh: '这个新实验室配备了最先进的设备。',
      partOfSpeech: 'noun',
      unitId: 'science-lab'
    },
    {
      id: 'science-3',
      word: 'Microscope',
      zh: '显微镜',
      pronunciation: '/ˈmaɪkrəˌskoʊp/',
      meaning: 'An instrument used to see objects too small for the naked eye',
      exampleSentence: 'She examined the cells under a microscope.',
      exampleSentence_zh: '她在显微镜下观察细胞。',
      partOfSpeech: 'noun',
      unitId: 'science-lab'
    },
    {
      id: 'science-4',
      word: 'Hypothesis',
      zh: '假设',
      pronunciation: '/haɪˈpɑːθəsɪs/',
      meaning: 'A proposed explanation for a phenomenon',
      exampleSentence: 'The researcher developed a hypothesis about how the virus spreads.',
      exampleSentence_zh: '研究人员提出了一个关于病毒如何传播的假设。',
      partOfSpeech: 'noun',
      unitId: 'science-lab'
    },
    {
      id: 'science-5',
      word: 'Beaker',
      zh: '烧杯',
      pronunciation: '/ˈbiːkər/',
      meaning: 'A cylindrical glass container for laboratory liquids',
      exampleSentence: 'She poured the chemical solution into a clean beaker.',
      exampleSentence_zh: '她将化学溶液倒入一个干净的烧杯中。',
      partOfSpeech: 'noun',
      unitId: 'science-lab'
    },
    {
      id: 'science-6',
      word: 'Analysis',
      zh: '分析',
      pronunciation: '/əˈnæləsɪs/',
      meaning: 'Detailed examination of something',
      exampleSentence: 'The laboratory performed a chemical analysis of the water sample.',
      exampleSentence_zh: '实验室对水样进行了化学分析。',
      partOfSpeech: 'noun',
      unitId: 'science-lab'
    },
    {
      id: 'science-7',
      word: 'Specimen',
      zh: '样本',
      pronunciation: '/ˈspesɪmən/',
      meaning: 'A sample taken for scientific testing or analysis',
      exampleSentence: 'The biologist collected several specimens from the rare plant species.',
      exampleSentence_zh: '生物学家从这种稀有植物中采集了几个样本。',
      partOfSpeech: 'noun',
      unitId: 'science-lab'
    },
    {
      id: 'science-8',
      word: 'Solution',
      zh: '溶液',
      pronunciation: '/səˈluːʃən/',
      meaning: 'A liquid mixture in which a solid, gas, or liquid is dissolved',
      exampleSentence: 'The chemist prepared a saline solution for the experiment.',
      exampleSentence_zh: '化学家为实验准备了盐水溶液。',
      partOfSpeech: 'noun',
      unitId: 'science-lab'
    },
    {
      id: 'science-9',
      word: 'Compound',
      zh: '化合物',
      pronunciation: '/ˈkɑːmpaʊnd/',
      meaning: 'A substance formed from two or more elements chemically united',
      exampleSentence: 'Water is a compound of hydrogen and oxygen.',
      exampleSentence_zh: '水是氢和氧形成的化合物。',
      partOfSpeech: 'noun',
      unitId: 'science-lab'
    },
    {
      id: 'science-10',
      word: 'Research',
      zh: '研究',
      pronunciation: '/ˈriːsərtʃ/',
      meaning: 'Systematic investigation to establish facts',
      exampleSentence: 'The university received a grant for cancer research.',
      exampleSentence_zh: '这所大学获得了癌症研究的资助。',
      partOfSpeech: 'noun',
      unitId: 'science-lab'
    },
    
    // 科技基础单元的单词
    {
      id: 'tech-1',
      word: 'Computer',
      zh: '计算机',
      pronunciation: '/kəmˈpjuːtər/',
      meaning: 'An electronic device for storing and processing data',
      exampleSentence: 'He uses his computer to write code every day.',
      exampleSentence_zh: '他每天使用计算机编写代码。',
      partOfSpeech: 'noun',
      unitId: 'technology'
    },
    {
      id: 'tech-2',
      word: 'Internet',
      zh: '互联网',
      pronunciation: '/ˈɪntərˌnɛt/',
      meaning: 'A global computer network',
      exampleSentence: 'The internet has revolutionized how we communicate.',
      exampleSentence_zh: '互联网彻底改变了我们的交流方式。',
      partOfSpeech: 'noun',
      unitId: 'technology'
    },
    {
      id: 'tech-3',
      word: 'Software',
      zh: '软件',
      pronunciation: '/ˈsɔftˌwɛr/',
      meaning: 'Programs and other operating information used by a computer',
      exampleSentence: 'We need to update the software on all our devices.',
      exampleSentence_zh: '我们需要更新所有设备上的软件。',
      partOfSpeech: 'noun',
      unitId: 'technology'
    },
    {
      id: 'tech-4',
      word: 'Hardware',
      zh: '硬件',
      pronunciation: '/ˈhɑːrdwɛr/',
      meaning: 'The physical components of a computer system',
      exampleSentence: 'The company upgraded its hardware to improve performance.',
      exampleSentence_zh: '公司升级了硬件以提高性能。',
      partOfSpeech: 'noun',
      unitId: 'technology'
    },
    {
      id: 'tech-5',
      word: 'Database',
      zh: '数据库',
      pronunciation: '/ˈdeɪtəˌbeɪs/',
      meaning: 'A structured set of data held in a computer',
      exampleSentence: 'The company stores all customer information in a secure database.',
      exampleSentence_zh: '公司将所有客户信息存储在一个安全的数据库中。',
      partOfSpeech: 'noun',
      unitId: 'technology'
    },
    {
      id: 'tech-6',
      word: 'Network',
      zh: '网络',
      pronunciation: '/ˈnɛtwɜːrk/',
      meaning: 'A number of interconnected computers and other devices',
      exampleSentence: 'The IT team manages our company\'s entire network.',
      exampleSentence_zh: 'IT团队管理着我们公司的整个网络。',
      partOfSpeech: 'noun',
      unitId: 'technology'
    },
    {
      id: 'tech-7',
      word: 'Cybersecurity',
      zh: '网络安全',
      pronunciation: '/ˌsaɪbərˈsɛkjərɪti/',
      meaning: 'The practice of protecting systems from digital attacks',
      exampleSentence: 'Companies invest heavily in cybersecurity to protect sensitive data.',
      exampleSentence_zh: '公司大力投资网络安全以保护敏感数据。',
      partOfSpeech: 'noun',
      unitId: 'technology'
    },
    {
      id: 'tech-8',
      word: 'Browser',
      zh: '浏览器',
      pronunciation: '/ˈbraʊzər/',
      meaning: 'A program that allows you to view websites',
      exampleSentence: 'Chrome and Firefox are popular web browsers.',
      exampleSentence_zh: 'Chrome和Firefox是流行的网页浏览器。',
      partOfSpeech: 'noun',
      unitId: 'technology'
    },
    {
      id: 'tech-9',
      word: 'Upload',
      zh: '上传',
      pronunciation: '/ˈʌpˌloʊd/',
      meaning: 'To transfer data from your computer to the internet',
      exampleSentence: 'Please upload your document to the shared folder.',
      exampleSentence_zh: '请将您的文档上传到共享文件夹。',
      partOfSpeech: 'verb',
      unitId: 'technology'
    },
    {
      id: 'tech-10',
      word: 'Download',
      zh: '下载',
      pronunciation: '/ˈdaʊnˌloʊd/',
      meaning: 'To transfer data from the internet to your computer',
      exampleSentence: 'You can download the app from the official website.',
      exampleSentence_zh: '您可以从官方网站下载该应用程序。',
      partOfSpeech: 'verb',
      unitId: 'technology'
    },
    
    // 数学术语单元的单词
    {
      id: 'math-1',
      word: 'Equation',
      zh: '方程',
      pronunciation: '/ɪˈkweɪʒən/',
      meaning: 'A statement that two expressions are equal',
      exampleSentence: 'The student solved the complex equation correctly.',
      exampleSentence_zh: '学生正确地解出了这个复杂的方程。',
      partOfSpeech: 'noun',
      unitId: 'mathematics'
    },
    {
      id: 'math-2',
      word: 'Geometry',
      zh: '几何',
      pronunciation: '/dʒiˈɑmətr/',
      meaning: 'The branch of mathematics concerned with shapes',
      exampleSentence: 'Geometry helps us understand the properties of circles and triangles.',
      exampleSentence_zh: '几何学帮助我们理解圆和三角形的性质。',
      partOfSpeech: 'noun',
      unitId: 'mathematics'
    },
    {
      id: 'math-3',
      word: 'Fraction',
      zh: '分数',
      pronunciation: '/ˈfrækʃən/',
      meaning: 'A numerical quantity that is not a whole number',
      exampleSentence: 'One-half is a simple fraction that everyone knows.',
      exampleSentence_zh: '二分之一是每个人都知道的简单分数。',
      partOfSpeech: 'noun',
      unitId: 'mathematics'
    },
    {
      id: 'math-4',
      word: 'Algebra',
      zh: '代数',
      pronunciation: '/ˈældʒəbrə/',
      meaning: 'The study of mathematical symbols and the rules for manipulating them',
      exampleSentence: 'We learned how to solve for x in algebra class today.',
      exampleSentence_zh: '今天我们在代数课上学习了如何求解 x。',
      partOfSpeech: 'noun',
      unitId: 'mathematics'
    },
    {
      id: 'math-5',
      word: 'Calculus',
      zh: '微积分',
      pronunciation: '/ˈkælkjələs/',
      meaning: 'The branch of mathematics that deals with derivatives and integrals',
      exampleSentence: 'Calculus is essential for understanding physics and engineering.',
      exampleSentence_zh: '微积分对理解物理和工程学至关重要。',
      partOfSpeech: 'noun',
      unitId: 'mathematics'
    },
    {
      id: 'math-6',
      word: 'Probability',
      zh: '概率',
      pronunciation: '/ˌprɑbəˈbɪləti/',
      meaning: 'The likelihood of something happening',
      exampleSentence: 'The probability of rolling a six on a fair die is one-sixth.',
      exampleSentence_zh: '在公平的骰子上掷出六点的概率是六分之一。',
      partOfSpeech: 'noun',
      unitId: 'mathematics'
    },
    {
      id: 'math-7',
      word: 'Theorem',
      zh: '定理',
      pronunciation: '/ˈθɪərəm/',
      meaning: 'A statement proven based on axioms and previous theorems',
      exampleSentence: 'The Pythagorean theorem relates the sides of a right triangle.',
      exampleSentence_zh: '勾股定理表示直角三角形边之间的关系。',
      partOfSpeech: 'noun',
      unitId: 'mathematics'
    },
    {
      id: 'math-8',
      word: 'Variable',
      zh: '变量',
      pronunciation: '/ˈvɛriəbl/',
      meaning: 'A quantity capable of assuming any of a set of values',
      exampleSentence: 'In the equation y = mx + b, x and y are variables.',
      exampleSentence_zh: '在方程 y = mx + b 中，x 和 y 是变量。',
      partOfSpeech: 'noun',
      unitId: 'mathematics'
    },
    {
      id: 'math-9',
      word: 'Function',
      zh: '函数',
      pronunciation: '/ˈfʌŋkʃən/',
      meaning: 'A relation between inputs and outputs',
      exampleSentence: 'A function assigns exactly one output to each input.',
      exampleSentence_zh: '函数为每个输入分配一个确定的输出。',
      partOfSpeech: 'noun',
      unitId: 'mathematics'
    },
    {
      id: 'math-10',
      word: 'Statistic',
      zh: '统计量',
      pronunciation: '/stəˈtɪstɪk/',
      meaning: 'A numerical fact or data collected in a study',
      exampleSentence: 'The mean is a commonly used statistic in data analysis.',
      exampleSentence_zh: '均值是数据分析中常用的统计量。',
      partOfSpeech: 'noun',
      unitId: 'mathematics'
    },
    
    // 机器人与人工智能单元的单词
    {
      id: 'robot-1',
      word: 'Algorithm',
      zh: '算法',
      pronunciation: '/ˈælɡəˌrɪðəm/',
      meaning: 'A process or set of rules to be followed in calculations or problem-solving',
      exampleSentence: 'Good algorithms are essential for efficient artificial intelligence.',
      exampleSentence_zh: '好的算法对高效的人工智能至关重要。',
      partOfSpeech: 'noun',
      unitId: 'robotics'
    },
    {
      id: 'robot-2',
      word: 'Automation',
      zh: '自动化',
      pronunciation: '/ˌɔtəˈmeɪʃən/',
      meaning: 'The use of machines to perform tasks without human assistance',
      exampleSentence: 'Automation has transformed manufacturing in the past century.',
      exampleSentence_zh: '自动化在过去的一个世纪彻底改变了制造业。',
      partOfSpeech: 'noun',
      unitId: 'robotics'
    },
    {
      id: 'robot-3',
      word: 'Intelligence',
      zh: '智能',
      pronunciation: '/ɪnˈtɛlɪdʒəns/',
      meaning: 'The ability to acquire and apply knowledge and skills',
      exampleSentence: 'Artificial intelligence aims to mimic human intelligence.',
      exampleSentence_zh: '人工智能旨在模仿人类智能。',
      partOfSpeech: 'noun',
      unitId: 'robotics'
    },
    {
      id: 'robot-4',
      word: 'Sensor',
      zh: '传感器',
      pronunciation: '/ˈsɛnsər/',
      meaning: 'A device that detects or measures a physical property',
      exampleSentence: 'The robot uses sensors to navigate around obstacles.',
      exampleSentence_zh: '机器人使用传感器绕过障碍物导航。',
      partOfSpeech: 'noun',
      unitId: 'robotics'
    },
    {
      id: 'robot-5',
      word: 'Machine Learning',
      zh: '机器学习',
      pronunciation: '/məˈʃiːn ˈlɜːrnɪŋ/',
      meaning: 'The ability of computers to learn without being explicitly programmed',
      exampleSentence: 'Machine learning algorithms improve through experience.',
      exampleSentence_zh: '机器学习算法通过经验不断改进。',
      partOfSpeech: 'noun',
      unitId: 'robotics'
    },
    {
      id: 'robot-6',
      word: 'Neural Network',
      zh: '神经网络',
      pronunciation: '/ˈnʊrəl ˈnɛtwɜːrk/',
      meaning: 'A computer system modeled on the human brain and nervous system',
      exampleSentence: 'The neural network learned to recognize faces after training.',
      exampleSentence_zh: '神经网络在训练后学会了识别人脸。',
      partOfSpeech: 'noun',
      unitId: 'robotics'
    },
    {
      id: 'robot-7',
      word: 'Prototype',
      zh: '原型',
      pronunciation: '/ˈproʊtəˌtaɪp/',
      meaning: 'An early sample or model built to test a concept',
      exampleSentence: 'The company developed a prototype of the new robot design.',
      exampleSentence_zh: '公司开发了新机器人设计的原型。',
      partOfSpeech: 'noun',
      unitId: 'robotics'
    },
    {
      id: 'robot-8',
      word: 'Autonomous',
      zh: '自主的',
      pronunciation: '/ɔːˈtɑːnəməs/',
      meaning: 'Acting independently or having the freedom to do so',
      exampleSentence: 'Autonomous vehicles can drive without human intervention.',
      exampleSentence_zh: '自主车辆可以在没有人为干预的情况下行驶。',
      partOfSpeech: 'adjective',
      unitId: 'robotics'
    },
    {
      id: 'robot-9',
      word: 'Interface',
      zh: '接口',
      pronunciation: '/ˈɪntərˌfeɪs/',
      meaning: 'A point where two systems meet and interact',
      exampleSentence: 'The user interface allows humans to interact with the robot.',
      exampleSentence_zh: '用户接口允许人类与机器人互动。',
      partOfSpeech: 'noun',
      unitId: 'robotics'
    },
    {
      id: 'robot-10',
      word: 'Drone',
      zh: '无人机',
      pronunciation: '/droʊn/',
      meaning: 'An unmanned aircraft or vehicle guided by remote control',
      exampleSentence: 'The drone captured aerial photos of the construction site.',
      exampleSentence_zh: '无人机拍摄了建筑工地的航拍照片。',
      partOfSpeech: 'noun',
      unitId: 'robotics'
    }
  ])

  const getAllUnits = computed(() => units.value)
  
  const getUnitById = (unitId) => {
    return units.value.find(unit => unit.id === unitId)
  }
  
  const getWordsByUnitId = (unitId) => {
    return words.value.filter(word => word.unitId === unitId)
  }
  
  const getWordById = (wordId) => {
    return words.value.find(word => word.id === wordId)
  }

  return {
    units,
    words,
    getAllUnits,
    getUnitById,
    getWordsByUnitId,
    getWordById
  }
})