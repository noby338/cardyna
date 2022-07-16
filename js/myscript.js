window.addEventListener('DOMContentLoaded', function () { //等待dom加载完成执行该代码

    let addF = document.querySelector('#add_f_btn'),
        addE = document.querySelector('#add_e_btn'),
        cardyna = document.querySelector('#cardyna'),
        content = document.querySelector('#content'),
        i = 1, //定义燃油车类的编号
        j = 1; //定义电动车类的编号

    addF.addEventListener('click', addNewFHtml); //添加点击事件
    addE.addEventListener('click', addNewEHtml);
    cardyna.addEventListener('click', ()=>location.reload());

    //燃油车类
    class FVeh {
        constructor(id) {

            // 获取输入元素
            this.main = document.querySelector(id); //该类对应的div对象
            this.presele = this.main.querySelector('.presele'); //输入框中的车辆预选参数
            this.vehName = this.main.querySelector('.veh_name'); //输入框中的车辆名
            this.fuelRightDiv = this.main.querySelector('.fuel_right_div'); //获取echarts容器大小变化
            this.optPlots = this.main.querySelectorAll('.opt_plot'); //获取曲线选择中的option

            this.coeAs = this.main.querySelectorAll('.coe_a'); //输入框中的拟合系数
            this.inputN = this.main.querySelectorAll('.input_n'); //输入框中的转速
            this.inputTtq = this.main.querySelectorAll('.input_ttq'); //输入框中的转矩
            this.inputB0 = this.main.querySelectorAll('.input_B0'); //输入框中的燃油消耗率系数
            this.inputB1 = this.main.querySelectorAll('.input_B1'); //输入框中的燃油消耗率系数
            this.inputB2 = this.main.querySelectorAll('.input_B2'); //输入框中的燃油消耗率系数
            this.inputB3 = this.main.querySelectorAll('.input_B3'); //输入框中的燃油消耗率系数
            this.inputB4 = this.main.querySelectorAll('.input_B4'); //输入框中的燃油消耗率系数
            this.transRats = this.main.querySelectorAll('.tran_rat'); //输入框中的各前进挡传动比
            this.mainRat = this.main.querySelector('.main_rat'); //输入框中主减速比
            this.engineSpeeds = this.main.querySelectorAll('.engine_speed'); //输入框中的发动机转速范围
            this.qid = this.main.querySelector('.qid'); //输入框中的发动机怠速油耗
            this.mechEffi = this.main.querySelector('.mech_effi'); //输入框中的传动效率
            this.radius = this.main.querySelector('.radius'); //输入框中的车轮滚动半径
            this.coeAir = this.main.querySelector('.coe_air'); //输入框中的空气阻力系数
            this.area = this.main.querySelector('.area'); //输入框中的迎风面积
            this.quality = this.main.querySelector('.quality'); //输入框中的整车质量
            this.selePlot = this.main.querySelector('.sele_plot'); //输出框中的曲线选择

            // 绑定echart
            this.myChart = echarts.init(this.main.querySelector('.fuel_chart'));

            //获取点击元素
            this.delBnt = this.main.querySelector('.del');
            this.resBnt = this.main.querySelector('.res');
            // this.testBnt = this.main.querySelector('.test');//用于开发测试


            //绑定事件
            this.delBnt.addEventListener('click', this.del);
            this.resBnt.addEventListener('click', this.getData.bind(this));
            this.resBnt.addEventListener('click', this.changePlot.bind(this.selePlot, this));
            this.selePlot.addEventListener('change', this.changePlot.bind(this.selePlot, this));

            window.addEventListener('resize', this.resizedom.bind(this)); //浏览器窗口大小监听

            // this.testBnt.addEventListener('click', this.testFun.bind(this));//用于测试开发

            this.presele.addEventListener('change', this.seleData.bind(this));
            // this.vehName.addEventListener('change', this.seleData.bind(this));

            //初始化数据
            this.init();

            //初始化曲线
            this.vainPlot = { //计算结果输出前展示的原始图
                title: {
                    text: '',
                    left: 'center',
                },
                toolbox: { //工具箱，如另存图片
                    right: 20,
                },
                radar: {
                    shape: 'circle',
                    splitNumber: '5',
                    backgroundColor: 'rgba(150, 100, 250, 0.4)',
                    center: ['50%', '45%'],
                    radius: ["10%", "50%"],
                    indicator: [{},
                        {},
                        {},
                        {},
                        {},
                        {},
                    ],
                    axisName: {
                        color: '#666',
                    },
                    splitArea: {
                        areaStyle: {
                            shadowColor: 'rgba(0, 0, 0, 0.2)',
                            shadowBlur: 10
                        }
                    },
                },
                series: [{
                    name: '',
                    type: 'radar',
                    data: [{
                        name: '',
                        symbol: 'circle',
                        symbolSize: 12,
                        lineStyle: {},
                        areaStyle: {
                            color: new echarts.graphic.RadialGradient(0.4, 0.6, 0.5, [{
                                    color: 'rgba(0, 145, 225, 0.01)',
                                    offset: 0
                                },
                                {
                                    color: 'rgba(0, 145, 225, 0.9)',
                                    offset: 1
                                }
                            ])
                        },
                        label: {
                            show: true,
                            formatter: function (params) {
                                return params.value;
                            }
                        }
                    }, ]
                }, ]
            };

            // 发动机外特性曲线配置项
            this.enginePlot = {
                title: { //题目
                    text: `${this.vehName.value} 发动机 外特性动力曲线`,
                    // link: 'https://echarts.apache.org/zh/option.html#title.link',
                    left: 'center',
                },
                tooltip: { //鼠标悬浮提示信息
                    trigger: 'axis', //折线图的线上
                    backgroundColor: 'rgba(250,250,250,0.3)'
                    // axisPointer: {//十字线
                    //     type: 'cross'
                    // },
                },
                legend: { //图例组件
                    top: 30
                    // data: ['扭力', '加速度', '燃油经济性', '驱动力'] //当series中的name存在时，本行可省略
                },
                animation: true, //图例翻页动画
                grid: { //网格配置，控制图表显示部分大小
                    show: true,
                    top: 60,
                    left: 30,
                    right: 20,
                    bottom: 15,
                    containLabel: true, //显示坐标轴上的数据
                    backgroundColor: 'rgba(250, 250, 250, 0.4)'
                },
                toolbox: { //工具箱，如另存图片
                    right: 20,
                    feature: {
                        saveAsImage: {}, //保存图片
                        restore: {}, //重置
                        dataView: {}, //数据框
                    }
                },
                xAxis: {
                    // type: 'category', //category类目 value值
                    name: '转速/(r/min)',
                    boundaryGap: true, //图表显示部分和坐标轴是否有缝隙
                    min: 0,
                    max: function (value) {
                        return Math.round(value.max) + 1000;
                    },
                    minorTick: { //是否显示刻度线
                        show: true
                    },
                    minorSplitLine: { //是否显示分割线
                        show: true
                    },
                    nameLocation: 'middle',
                    nameGap: 20, //轴名字移动
                    // nameRotate: -90 //轴名字旋转
                },
                yAxis: [{
                    name: '功率/(KW)',
                    min: 0, //设置坐标轴范围
                    max: function (value) {
                        return Math.round(value.max) + 50;
                    },
                    minorTick: {
                        show: true
                    },
                    minorSplitLine: {
                        show: true
                    },
                    axisLabel: {
                        // formatter: '{value} KW' //坐标轴上的数据单位
                    }
                }, {
                    name: '转矩/(N.m)',
                    min: function (value) {
                        return Math.round(value.min) - 50;
                    },
                    max: function (value) {
                        return Math.round(value.max) + 50;
                    },
                    minorTick: {
                        show: true
                    },
                    minorSplitLine: {
                        show: true
                    },
                    axisLabel: {
                        // formatter: '{value} N.m' //坐标轴上的数据单位
                    }
                }],
                dataZoom: [{ //是否允许图表放大缩小
                    show: true,
                    type: 'inside', //slider表示外置拖动条
                    filterMode: 'none', //数据过滤
                    xAxisIndex: [0],
                    start: 0,
                    end: 100
                }, {
                    show: true,
                    type: 'inside',
                    filterMode: 'none',
                    yAxisIndex: [0, 1], //缩放时影响第一和第二个y轴
                    start: 0,
                    end: 100
                }],
                series: [ //系列图表配置，决定显示的图标类型 
                    {
                        type: 'line',
                        name: '功率/(KW)',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // data: this.peData(),
                    }, {
                        type: 'line', //图的种类是线
                        name: '转矩/(N.m)',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        yAxisIndex: 1, //选择该曲线的坐标轴
                        // smooth: true, //曲线平滑
                    }
                    // color: ['red', 'yellow']可用于修改颜色
                ]
            };

            //加速时间
            this.tPlot = {
                title: { //题目
                    text: `${this.vehName.value} 车辆 加速时间`,
                    left: 'center',
                },
                tooltip: { //鼠标悬浮提示信息
                    trigger: 'axis', //折线图的线上
                    backgroundColor: 'rgba(250,250,250,0.3)'
                },
                legend: { //图例组件
                    top: 30
                },
                animation: true, //图例翻页动画
                grid: { //网格配置，控制图表显示部分大小
                    show: true,
                    top: 60,
                    left: 30,
                    right: 20,
                    bottom: 15,
                    containLabel: true, //显示坐标轴上的数据
                    backgroundColor: 'rgba(120, 140, 200, 0.2)'
                },
                toolbox: { //工具箱，如另存图片
                    right: 20,
                    feature: {
                        saveAsImage: {}, //保存图片
                        restore: {}, //重置
                        dataView: {}, //数据框
                    }
                },
                xAxis: {
                    name: '车速/(km/h)',
                    boundaryGap: true, //图表显示部分和坐标轴是否有缝隙
                    min: 0,
                    max: function (value) {
                        return Math.round(value.max) + 20;
                    },
                    minorTick: { //是否显示刻度线
                        show: true
                    },
                    minorSplitLine: { //是否显示分割线
                        show: true
                    },
                    nameLocation: 'middle',
                    nameGap: 20, //轴名字移动
                },
                yAxis: [{
                    name: '时间(s)',
                    min: 0, //设置坐标轴范围
                    max: function (value) {
                        return Math.round(value.max) + 20;
                    },
                    minorTick: {
                        show: true
                    },
                    minorSplitLine: {
                        show: true
                    },
                    axisLabel: {
                        // formatter: '{value} KW' //坐标轴上的数据单位
                    }
                }],
                dataZoom: [{ //是否允许图表放大缩小
                    show: true,
                    type: 'inside', //slider表示外置拖动条
                    filterMode: 'none', //数据过滤
                    xAxisIndex: [0],
                    start: 0,
                    end: 100
                }, {
                    show: true,
                    type: 'inside',
                    filterMode: 'none',
                    yAxisIndex: [0, 1], //缩放时影响第一和第二个y轴
                    start: 0,
                    end: 100
                }],
                series: [ //系列图表配置，决定显示的图标类型 
                    {
                        type: 'line',
                        name: '时间(s)',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },

                        },
                    }
                ]
            };

            //负荷特性曲线
            this.bPlot = {
                title: { //题目
                    text: '车辆 燃油消耗率曲线',
                    left: 'center',
                },
                tooltip: { //鼠标悬浮提示信息
                    trigger: 'axis', //折线图的线上
                    backgroundColor: 'rgba(250 ,250 ,250 ,0.3)'
                },
                legend: { //图例组件
                    top: 40
                },
                animation: true, //图例翻页动画
                grid: { //网格配置，控制图表显示部分大小
                    show: true,
                    top: 60,
                    left: 30,
                    right: 20,
                    bottom: 15,
                    containLabel: true, //显示坐标轴上的数据
                    backgroundColor: 'rgba(250, 250, 250, 0.4)'
                },
                toolbox: { //工具箱，如另存图片
                    right: 20,
                    feature: {
                        saveAsImage: {}, //保存图片
                        restore: {}, //重置
                        dataView: {}, //数据框
                    }
                },
                xAxis: {
                    name: '发动机功率/(kw)',
                    boundaryGap: true, //图表显示部分和坐标轴是否有缝隙
                    min: 0,
                    max: function (value) {
                        return Math.round(value.max) + 5;
                    },
                    minorTick: { //是否显示刻度线
                        show: true
                    },
                    minorSplitLine: { //是否显示分割线
                        show: true
                    },
                    nameLocation: 'middle',
                    nameGap: 20, //轴名字移动
                    // nameRotate: -90 //轴名字旋转
                },
                yAxis: {
                    name: '燃油消耗率(g/kw.h)',
                    min: function (value) {
                        return Math.round(value.min) - 100;
                    }, //设置坐标轴范围
                    max: function (value) {
                        return Math.round(value.max) + 100;
                    },
                    minorTick: {
                        show: true
                    },
                    minorSplitLine: {
                        show: true
                    },
                    axisLabel: {
                        // formatter: '{value} KW' //坐标轴上的数据单位
                    }
                },


                dataZoom: [{ //是否允许图表放大缩小
                    show: true,
                    type: 'inside', //slider表示外置拖动条
                    filterMode: 'none', //数据过滤
                    xAxisIndex: [0],
                    start: 0,
                    end: 100
                }, {
                    show: true,
                    type: 'inside',
                    filterMode: 'none',
                    yAxisIndex: [0], //缩放时影响第一和第二个y轴
                    start: 0,
                    end: 100
                }],
                series: [ //系列图表配置，决定显示的图标类型 
                    {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },

                        },
                        // data: this.ffData(),
                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },

                        },
                        // data: this.ffData(),
                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },

                        },
                        // data: this.ffData(),
                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },

                        },
                        // data: this.ffData(),
                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },

                        },
                        // data: this.ffData(),
                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },

                        },
                        // data: this.ffData(),
                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },

                        },
                        // data: this.ffData(),
                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },

                        },
                        // data: this.ffData(),
                    }
                    // smooth: true, //曲线平滑
                    // data: this.fwData(),



                    // color: ['red', 'yellow']可用于修改颜色

                ]
            };

            //车辆 驱动力——行驶阻力曲线
            this.fPlot = {
                title: { //题目
                    text: '车辆 驱动力——行驶阻力曲线',
                    left: 'center',

                },
                tooltip: { //鼠标悬浮提示信息
                    trigger: 'axis', //折线图的线上
                    backgroundColor: 'rgba(250,250,250,0.1)'

                    // axisPointer: {//十字线
                    //     type: 'cross'
                    // },
                },
                legend: { //图例组件
                    top: 30
                    // data: ['扭力', '加速度', '燃油经济性', '驱动力'] //当series中的name存在时，本行可省略
                },
                animation: true, //图例翻页动画
                grid: { //网格配置，控制图表显示部分大小
                    show: true,
                    top: 60,
                    left: 30,
                    right: 20,
                    bottom: 15,
                    containLabel: true, //显示坐标轴上的数据
                    backgroundColor: 'rgba(40, 250, 250, 0.2)'
                },
                toolbox: { //工具箱，如另存图片
                    right: 20,
                    feature: {
                        saveAsImage: {}, //保存图片
                        restore: {}, //重置
                        dataView: {}, //数据框

                    }
                },
                xAxis: {
                    // type: 'category', //category类目 value值

                    name: '车速/(km/h)',
                    boundaryGap: true, //图表显示部分和坐标轴是否有缝隙
                    min: 0,
                    max: function (value) {
                        return value.max + 10;
                    },
                    minorTick: { //是否显示刻度线
                        show: true
                    },
                    minorSplitLine: { //是否显示分割线
                        show: true
                    },
                    nameLocation: 'middle',
                    nameGap: 20, //轴名字移动
                    // nameRotate: -90 //轴名字旋转
                },
                yAxis: {
                    name: '力/(N)',
                    min: 0, //设置坐标轴范围
                    max: function (value) {
                        return value.max + 1000;
                    },
                    minorTick: {
                        show: true
                    },
                    minorSplitLine: {
                        show: true
                    },
                    axisLabel: {
                        // formatter: '{value} KW' //坐标轴上的数据单位
                    }
                },


                dataZoom: [{ //是否允许图表放大缩小
                    show: true,
                    type: 'inside', //slider表示外置拖动条
                    filterMode: 'none', //数据过滤
                    xAxisIndex: [0],
                    start: 0,
                    end: 100
                }, {
                    show: true,
                    type: 'inside',
                    filterMode: 'none',
                    yAxisIndex: [0], //缩放时影响第一和第二个y轴
                    start: 0,
                    end: 100
                }],
                series: [ //系列图表配置，决定显示的图标类型 
                    {
                        type: 'line',
                        name: 'Fw+Ff',
                        color: 'rgb(150,150,150)',
                        areaStyle: {
                            opacity: 0.4
                        },
                        showSymbol: false,
                        clip: true,
                        // data: this.ffData(),
                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        }
                    }
                    // color: ['red', 'yellow']可用于修改颜色

                ]
            };

            //车辆 功率平衡曲线
            this.pPlot = {
                title: { //题目
                    text: '车辆 功率平衡曲线',
                    left: 'center',

                },
                tooltip: { //鼠标悬浮提示信息
                    trigger: 'axis', //折线图的线上
                    backgroundColor: 'rgba(250,250,250,0.3)'

                    // axisPointer: {//十字线
                    //     type: 'cross'
                    // },
                },
                legend: { //图例组件
                    top: 30
                    // data: ['扭力', '加速度', '燃油经济性', '驱动力'] //当series中的name存在时，本行可省略
                },
                animation: true, //图例翻页动画
                grid: { //网格配置，控制图表显示部分大小
                    show: true,
                    top: 60,
                    left: 30,
                    right: 20,
                    bottom: 15,
                    containLabel: true, //显示坐标轴上的数据
                    backgroundColor: 'rgba(250, 0, 250, 0.1)'
                },
                toolbox: { //工具箱，如另存图片
                    right: 20,
                    feature: {
                        saveAsImage: {}, //保存图片
                        restore: {}, //重置
                        dataView: {}, //数据框

                    }
                },
                xAxis: {
                    // type: 'category', //category类目 value值

                    name: '车速/(km/h)',
                    boundaryGap: true, //图表显示部分和坐标轴是否有缝隙
                    min: 0,
                    max: function (value) {
                        return value.max + 10;
                    },
                    minorTick: { //是否显示刻度线
                        show: true
                    },
                    minorSplitLine: { //是否显示分割线
                        show: true
                    },
                    nameLocation: 'middle',
                    nameGap: 20, //轴名字移动
                    // nameRotate: -90 //轴名字旋转
                },
                yAxis: {
                    name: '功率/(KW)',
                    min: 0, //设置坐标轴范围
                    max: function (value) {
                        return Math.round(value.max) + 5;
                    },
                    minorTick: {
                        show: true
                    },
                    minorSplitLine: {
                        show: true
                    },
                    axisLabel: {
                        // formatter: '{value} KW' //坐标轴上的数据单位
                    }
                },


                dataZoom: [{ //是否允许图表放大缩小
                    show: true,
                    type: 'inside', //slider表示外置拖动条
                    filterMode: 'none', //数据过滤
                    xAxisIndex: [0],
                    start: 0,
                    end: 100
                }, {
                    show: true,
                    type: 'inside',
                    filterMode: 'none',
                    yAxisIndex: [0], //缩放时影响第一和第二个y轴
                    start: 0,
                    end: 100
                }],
                series: [ //系列图表配置，决定显示的图标类型 
                    {
                        type: 'line',
                        name: '(Pw+Pf)/nT',
                        color: 'rgb(150,150,150)',
                        areaStyle: {
                            opacity: 0.4
                        },
                        showSymbol: false,
                        clip: true,
                        // data: this.ffData(),
                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        }
                    }
                    // color: ['red', 'yellow']可用于修改颜色

                ]
            };

            //后备功率曲线
            this.ppPlot = {
                title: { //题目
                    text: '后备功率曲线',
                    left: 'center',

                },
                tooltip: { //鼠标悬浮提示信息
                    trigger: 'axis', //折线图的线上
                    backgroundColor: 'rgba(250,250,250,0.3)'

                    // axisPointer: {//十字线
                    //     type: 'cross'
                    // },
                },
                legend: { //图例组件
                    top: 30
                    // data: ['扭力', '加速度', '燃油经济性', '驱动力'] //当series中的name存在时，本行可省略
                },
                animation: true, //图例翻页动画
                grid: { //网格配置，控制图表显示部分大小
                    show: true,
                    top: 60,
                    left: 30,
                    right: 20,
                    bottom: 15,
                    containLabel: true, //显示坐标轴上的数据
                    backgroundColor: 'rgba(250, 0, 250, 0.1)'
                },
                toolbox: { //工具箱，如另存图片
                    right: 20,
                    feature: {
                        saveAsImage: {}, //保存图片
                        restore: {}, //重置
                        dataView: {}, //数据框

                    }
                },
                xAxis: {
                    // type: 'category', //category类目 value值

                    name: '车速/(km/h)',
                    boundaryGap: true, //图表显示部分和坐标轴是否有缝隙
                    min: 0,
                    max: function (value) {
                        return value.max + 10;
                    },
                    minorTick: { //是否显示刻度线
                        show: true
                    },
                    minorSplitLine: { //是否显示分割线
                        show: true
                    },
                    nameLocation: 'middle',
                    nameGap: 20, //轴名字移动
                    // nameRotate: -90 //轴名字旋转
                },
                yAxis: {
                    name: '功率/(KW)',
                    min: 0, //设置坐标轴范围
                    max: function (value) {
                        return Math.round(value.max) + 10;
                    },
                    minorTick: {
                        show: true
                    },
                    minorSplitLine: {
                        show: true
                    },
                    axisLabel: {
                        // formatter: '{value} KW' //坐标轴上的数据单位
                    }
                },


                dataZoom: [{ //是否允许图表放大缩小
                    show: true,
                    type: 'inside', //slider表示外置拖动条
                    filterMode: 'none', //数据过滤
                    xAxisIndex: [0],
                    start: 0,
                    end: 100
                }, {
                    show: true,
                    type: 'inside',
                    filterMode: 'none',
                    yAxisIndex: [0], //缩放时影响第一和第二个y轴
                    start: 0,
                    end: 100
                }],
                series: [ //系列图表配置，决定显示的图标类型 
                    {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }
                    // color: ['red', 'yellow']可用于修改颜色

                ]
            };

            //加速度曲线
            this.aPlot = {
                title: { //题目
                    text: '车辆 加速度曲线',
                    left: 'center',

                },
                tooltip: { //鼠标悬浮提示信息
                    trigger: 'axis', //折线图的线上
                    backgroundColor: 'rgba(250,250,250,0.3)'

                    // axisPointer: {//十字线
                    //     type: 'cross'
                    // },
                },
                legend: { //图例组件
                    top: 30
                    // data: ['扭力', '加速度', '燃油经济性', '驱动力'] //当series中的name存在时，本行可省略
                },
                animation: true, //图例翻页动画
                grid: { //网格配置，控制图表显示部分大小
                    show: true,
                    top: 60,
                    left: 30,
                    right: 20,
                    bottom: 15,
                    containLabel: true, //显示坐标轴上的数据
                    backgroundColor: 'rgba(250, 250, 0, 0.1)'
                },
                toolbox: { //工具箱，如另存图片
                    right: 20,
                    feature: {
                        saveAsImage: {}, //保存图片
                        restore: {}, //重置
                        dataView: {}, //数据框

                    }
                },
                xAxis: {
                    // type: 'category', //category类目 value值

                    name: '车速/(km/h)',
                    boundaryGap: true, //图表显示部分和坐标轴是否有缝隙
                    min: 0,
                    max: function (value) {
                        return value.max + 10;
                    },
                    minorTick: { //是否显示刻度线
                        show: true
                    },
                    minorSplitLine: { //是否显示分割线
                        show: true
                    },
                    nameLocation: 'middle',
                    nameGap: 20, //轴名字移动
                    // nameRotate: -90 //轴名字旋转
                },
                yAxis: {
                    name: '加速度(m/s²)',
                    min: 0, //设置坐标轴范围
                    max: function (value) {
                        return Math.round(value.max) + 1;
                    },
                    minorTick: {
                        show: true
                    },
                    minorSplitLine: {
                        show: true
                    },
                    axisLabel: {
                        // formatter: '{value} KW' //坐标轴上的数据单位
                    }
                },


                dataZoom: [{ //是否允许图表放大缩小
                    show: true,
                    type: 'inside', //slider表示外置拖动条
                    filterMode: 'none', //数据过滤
                    xAxisIndex: [0],
                    start: 0,
                    end: 100
                }, {
                    show: true,
                    type: 'inside',
                    filterMode: 'none',
                    yAxisIndex: [0], //缩放时影响第一和第二个y轴
                    start: 0,
                    end: 100
                }],
                series: [ //系列图表配置，决定显示的图标类型 
                    {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }

                ]
            };
            //加速度倒数曲线
            this.aaPlot = {
                title: { //题目
                    text: '车辆 加速度倒数曲线',
                    left: 'center',

                },
                tooltip: { //鼠标悬浮提示信息
                    trigger: 'axis', //折线图的线上
                    backgroundColor: 'rgba(250,250,250,0.3)'

                    // axisPointer: {//十字线
                    //     type: 'cross'
                    // },
                },
                legend: { //图例组件
                    top: 30
                    // data: ['扭力', '加速度', '燃油经济性', '驱动力'] //当series中的name存在时，本行可省略
                },
                animation: true, //图例翻页动画
                grid: { //网格配置，控制图表显示部分大小
                    show: true,
                    top: 60,
                    left: 30,
                    right: 20,
                    bottom: 15,
                    containLabel: true, //显示坐标轴上的数据
                    backgroundColor: 'rgba(250, 250, 0, 0.1)'
                },
                toolbox: { //工具箱，如另存图片
                    right: 20,
                    feature: {
                        saveAsImage: {}, //保存图片
                        restore: {}, //重置
                        dataView: {}, //数据框

                    }
                },
                xAxis: {
                    // type: 'category', //category类目 value值

                    name: '车速/(km/h)',
                    boundaryGap: true, //图表显示部分和坐标轴是否有缝隙
                    min: 0,
                    max: function (value) {
                        return value.max + 10;
                    },
                    minorTick: { //是否显示刻度线
                        show: true
                    },
                    minorSplitLine: { //是否显示分割线
                        show: true
                    },
                    nameLocation: 'middle',
                    nameGap: 20, //轴名字移动
                    // nameRotate: -90 //轴名字旋转
                },
                yAxis: {
                    name: '加速度倒数/(s²/m)',
                    min: 0, //设置坐标轴范围
                    max: function (value) {
                        return Math.round(value.max + 0.5);
                    },
                    minorTick: {
                        show: true
                    },
                    minorSplitLine: {
                        show: true
                    },
                    axisLabel: {
                        // formatter: '{value} KW' //坐标轴上的数据单位
                    }
                },


                dataZoom: [{ //是否允许图表放大缩小
                    show: true,
                    type: 'inside', //slider表示外置拖动条
                    filterMode: 'none', //数据过滤
                    xAxisIndex: [0],
                    start: 0,
                    end: 100
                }, {
                    show: true,
                    type: 'inside',
                    filterMode: 'none',
                    yAxisIndex: [0], //缩放时影响第一和第二个y轴
                    start: 0,
                    end: 100
                }],
                series: [ //系列图表配置，决定显示的图标类型 
                    {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'min',
                                name: 'Min'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'min',
                                name: 'Min'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'min',
                                name: 'Min'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'min',
                                name: 'Min'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'min',
                                name: 'Min'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'min',
                                name: 'Min'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'min',
                                name: 'Min'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'min',
                                name: 'Min'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }

                ]
            };

            //爬坡度曲线
            this.iPlot = {
                title: { //题目
                    text: '车辆 爬坡度曲线',
                    left: 'center',

                },
                tooltip: { //鼠标悬浮提示信息
                    trigger: 'axis', //折线图的线上
                    backgroundColor: 'rgba(250,250,250,0.3)'

                    // axisPointer: {//十字线
                    //     type: 'cross'
                    // },
                },
                legend: { //图例组件
                    top: 30
                    // data: ['扭力', '加速度', '燃油经济性', '驱动力'] //当series中的name存在时，本行可省略
                },
                animation: true, //图例翻页动画
                grid: { //网格配置，控制图表显示部分大小
                    show: true,
                    top: 60,
                    left: 30,
                    right: 20,
                    bottom: 15,
                    containLabel: true, //显示坐标轴上的数据
                    backgroundColor: 'rgba(150, 200, 250, 0.1)'
                },
                toolbox: { //工具箱，如另存图片
                    right: 20,
                    feature: {
                        saveAsImage: {}, //保存图片
                        restore: {}, //重置
                        dataView: {}, //数据框

                    }
                },
                xAxis: {
                    // type: 'category', //category类目 value值

                    name: '车速/(km/h)',
                    boundaryGap: true, //图表显示部分和坐标轴是否有缝隙
                    min: 0,
                    max: function (value) {
                        return value.max + 20;
                    },
                    minorTick: { //是否显示刻度线
                        show: true
                    },
                    minorSplitLine: { //是否显示分割线
                        show: true
                    },
                    nameLocation: 'middle',
                    nameGap: 20, //轴名字移动
                    // nameRotate: -90 //轴名字旋转
                },
                yAxis: {
                    name: '爬坡度/(%)',
                    min: 0, //设置坐标轴范围
                    max: function (value) {
                        return Math.round(value.max + 5);
                    },
                    minorTick: {
                        show: true
                    },
                    minorSplitLine: {
                        show: true
                    },
                    axisLabel: {
                        // formatter: '{value} KW' //坐标轴上的数据单位
                    }
                },


                dataZoom: [{ //是否允许图表放大缩小
                    show: true,
                    type: 'inside', //slider表示外置拖动条
                    filterMode: 'none', //数据过滤
                    xAxisIndex: [0],
                    start: 0,
                    end: 100
                }, {
                    show: true,
                    type: 'inside',
                    filterMode: 'none',
                    yAxisIndex: [0], //缩放时影响第一和第二个y轴
                    start: 0,
                    end: 100
                }],
                series: [ //系列图表配置，决定显示的图标类型 
                    {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // data: this.ffData(),
                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),
                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),
                    }
                    // color: ['red', 'yellow']可用于修改颜色

                ]
            };

            //综合性能雷达图
            this.radar = {

                title: {
                    text: '',
                    left: 'center',
                },

                toolbox: { //工具箱，如另存图片
                    right: 20,
                    feature: {
                        saveAsImage: {}, //保存图片


                    }
                },
                // tooltip: { //鼠标悬浮提示信息
                //     trigger: 'item',
                //     backgroundColor: 'rgba(250,250,250,0.3)'

                // },

                radar: {
                    shape: 'circle',
                    splitNumber: '5',
                    backgroundColor: 'rgba(150, 100, 250, 0.7)',
                    center: ['50%', '45%'],
                    radius: ["10%", "50%"],
                    indicator: [{
                            name: '最大车速',
                            max: 360
                        },
                        {
                            name: '最大爬坡度',
                            max: 150
                        },
                        {
                            name: '最大扭矩',
                            max: 1000
                        },
                        {
                            name: '最大功率',
                            max: 514
                        },
                        {
                            name: '0——100加速时间',
                            max: 0,
                            min: 70,
                            inverse: true
                        },
                        {
                            name: '等速百公里燃油消耗量',
                            max: 0,
                            min: 30,
                            inverse: true
                        }, {
                            name: 'NEDC百公里燃油消耗量',
                            max: 0,
                            min: 30,
                            inverse: true
                        }
                    ],


                    axisName: {
                        color: '#666',
                        // backgroundColor: '#aaa',
                        // borderRadius: 3,
                        // padding: [5, 7]
                    },
                    splitArea: {
                        areaStyle: {
                            // color: ['#77EADF', '#26C3BE', '#64AFE9', '#428BD4'],
                            shadowColor: 'rgba(0, 0, 0, 0.2)',
                            shadowBlur: 10
                        }
                    },


                },

                series: [{
                        name: '性能',
                        type: 'radar',
                        data: [{
                                // value: [200, 0.3, 300, 100, 1 / 5.2, 1 / 7],
                                name: '',
                                symbol: 'circle',
                                symbolSize: 12,
                                lineStyle: {
                                    // type: 'dashed'
                                },
                                areaStyle: {
                                    color: new echarts.graphic.RadialGradient(0.1, 0.6, 1, [{
                                            color: 'rgba(0, 145, 225, 0.1)',
                                            offset: 0
                                        },
                                        {
                                            color: 'rgba(0, 145, 225, 0.9)',
                                            offset: 1
                                        }
                                    ])
                                },

                                label: {
                                    show: true,
                                    formatter: function (params) {
                                        return params.value;
                                    }
                                }
                            },

                        ]
                    },

                ]

            };

            //百公里燃油消耗量
            this.qsPlot = {
                title: { //题目
                    text: `${this.vehName.value} 百公里燃油消耗量`,
                    // link: 'https://echarts.apache.org/zh/option.html#title.link',
                    left: 'center',
                },
                tooltip: { //鼠标悬浮提示信息
                    trigger: 'axis', //折线图的线上
                    backgroundColor: 'rgba(250,250,250,0.3)'

                    // axisPointer: {//十字线
                    //     type: 'cross'
                    // },
                },
                legend: { //图例组件
                    top: 30
                    // data: ['扭力', '加速度', '燃油经济性', '驱动力'] //当series中的name存在时，本行可省略
                },
                animation: true, //图例翻页动画
                grid: { //网格配置，控制图表显示部分大小
                    show: true,
                    top: 60,
                    left: 30,
                    right: 20,
                    bottom: 15,
                    containLabel: true, //显示坐标轴上的数据
                    backgroundColor: 'rgba(250, 50, 50, 0.1)'
                },
                toolbox: { //工具箱，如另存图片
                    right: 20,
                    feature: {
                        saveAsImage: {}, //保存图片
                        restore: {}, //重置
                        dataView: {}, //数据框

                    }
                },


                xAxis: {
                    // type: 'category', //category类目 value值

                    name: '车速(km/h)',
                    boundaryGap: true, //图表显示部分和坐标轴是否有缝隙
                    min: 0,
                    max: function (value) {
                        return Math.round(value.max + 20);
                    },
                    minorTick: { //是否显示刻度线
                        show: true
                    },
                    minorSplitLine: { //是否显示分割线
                        show: true
                    },
                    nameLocation: 'middle',
                    nameGap: 20, //轴名字移动
                    // nameRotate: -90 //轴名字旋转
                },
                yAxis: [{
                    name: '燃油消耗量(L/100km)',
                    min: 0, //设置坐标轴范围
                    max: function (value) {
                        return Math.round(value.max + 3);
                    },
                    minorTick: {
                        show: true
                    },
                    minorSplitLine: {
                        show: true
                    },
                    axisLabel: {
                        // formatter: '{value} KW' //坐标轴上的数据单位
                    }
                }],

                dataZoom: [{ //是否允许图表放大缩小
                    show: true,
                    type: 'inside', //slider表示外置拖动条
                    filterMode: 'none', //数据过滤
                    xAxisIndex: [0],
                    start: 0,
                    end: 100
                }, {
                    show: true,
                    type: 'inside',
                    filterMode: 'none',
                    yAxisIndex: [0, 1], //缩放时影响第一和第二个y轴
                    start: 0,
                    end: 100
                }],
                series: [ //系列图表配置，决定显示的图标类型 
                    {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        smooth: true, //曲线平滑
                        // markPoint: {
                        //     symbol: 'circle',
                        //     symbolSize: 5,
                        //     label: {
                        //         fontSize: 8,
                        //         position: [0, -10]
                        //     },
                        //     data: [
                        //         { type: 'max', name: 'Max' },
                        //     ]
                        // },


                        // data: this.peData(),

                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        smooth: true, //曲线平滑

                        // data: this.peData(),

                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        smooth: true, //曲线平滑

                        // data: this.peData(),

                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        smooth: true, //曲线平滑

                        // data: this.peData(),

                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        smooth: true, //曲线平滑

                        // data: this.peData(),

                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        smooth: true, //曲线平滑

                        // data: this.peData(),

                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        smooth: true, //曲线平滑

                        // data: this.peData(),

                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        smooth: true, //曲线平滑

                        // data: this.peData(),

                    }
                    // color: ['red', 'yellow']可用于修改颜色

                ]
            };

            //NEDC循环
            this.cirPlot = {
                title: { //题目
                    text: `${this.vehName.value} 车辆 NEDC循环工况测试曲线`,
                    left: 'center',
                },
                tooltip: { //鼠标悬浮提示信息
                    trigger: 'axis', //折线图的线上
                    backgroundColor: 'rgba(250,250,250,0.3)'
                },
                legend: { //图例组件
                    top: 30
                },
                animation: true, //图例翻页动画
                grid: { //网格配置，控制图表显示部分大小
                    show: true,
                    top: 60,
                    left: 30,
                    right: 20,
                    bottom: 15,
                    containLabel: true, //显示坐标轴上的数据
                    backgroundColor: 'rgba(120, 140, 200, 0.2)'
                },
                toolbox: { //工具箱，如另存图片
                    right: 20,
                    feature: {
                        saveAsImage: {}, //保存图片
                        restore: {}, //重置
                        dataView: {}, //数据框
                    }
                },
                xAxis: {
                    name: '时间/(s)',
                    boundaryGap: true, //图表显示部分和坐标轴是否有缝隙
                    min: 0,
                    max: function (value) {
                        return Math.round(value.max) + 20;
                    },
                    minorTick: { //是否显示刻度线
                        show: true
                    },
                    minorSplitLine: { //是否显示分割线
                        show: true
                    },
                    nameLocation: 'middle',
                    nameGap: 20, //轴名字移动
                },
                yAxis: [{
                    name: '车速/(km/h)',
                    min: 0, //设置坐标轴范围
                    max: function (value) {
                        return Math.round(value.max) + 20;
                    },
                    minorTick: {
                        show: true
                    },
                    minorSplitLine: {
                        show: true
                    },
                    axisLabel: {
                        // formatter: '{value} KW' //坐标轴上的数据单位
                    }
                }],
                dataZoom: [{ //是否允许图表放大缩小
                    show: true,
                    type: 'inside', //slider表示外置拖动条
                    filterMode: 'none', //数据过滤
                    xAxisIndex: [0],
                    start: 0,
                    end: 100
                }, {
                    show: true,
                    type: 'inside',
                    filterMode: 'none',
                    yAxisIndex: [0, 1], //缩放时影响第一和第二个y轴
                    start: 0,
                    end: 100
                }],
                series: [ //系列图表配置，决定显示的图标类型 
                    {
                        type: 'line',
                        name: '车速/(km/h)',
                        showSymbol: false,
                        clip: true,
                        // markPoint: {
                        //     symbol: 'circle',
                        //     symbolSize: 5,
                        //     label: {
                        //         fontSize: 8,
                        //         position: [0, -10]
                        //     },

                        // },
                    }
                ]
            };

            //初始化输出echarts
            this.myChart.setOption(this.vainPlot, true);
            // this.myChart.on('click', function(params) {
            //     if (params.componentType === 'series') {
            //         window.alert(11)
            //     }
            //     window.open('https://www.baidu.com/s?wd=' + encodeURIComponent(params.name));
            // }) 


        }

        init() {
            //初始化数据
            this.dtNTtqs = []; //初始化数组用于存储转速和转矩
            this.dtNBs = []; //初始化数组用于存储转速和燃油消耗率拟合系数
            this.dtCoeAs = []; //拟合系数
            this.dtTransRats = []; //各档传动比
            this.dtMainRat; //主减速比
            this.dtEngineSpeeds = []; //发动机转速范围
            this.dtMechEffi; //传动机械效率
            this.dtRadius; //车轮滚动半径
            this.dtCoeAir; //空阻系数
            this.dtArea; //迎风面积
            this.dtQuality; //整车质量
            this.dtG = 9.8; //g值
            this.dtrou = 0.71 //汽油密度

            this.selePlot.disabled = true; //禁用选择曲线框
        }

        del() { //删除键函数
            this.parentNode.parentNode.parentNode.remove();
        }

        resizedom() { //重置echarts，dom容器大小
            this.myChart.resize({
                width: this.fuelRightDiv.offsetWidth,
            });
        }

        seleData() { //输入框预选车辆参数
            if (this.presele.value == 0) {
                this.vehName.value = '';

                this.coeAs[0].value = '';
                this.coeAs[1].value = '';
                this.coeAs[2].value = '';
                this.coeAs[3].value = '';
                this.coeAs[4].value = '';
                this.coeAs[5].value = '';
                this.coeAs[6].value = '';
                this.coeAs[7].value = '';

                this.inputN[0].value = '';
                this.inputN[1].value = '';
                this.inputN[2].value = '';
                this.inputN[3].value = '';
                this.inputN[4].value = '';
                this.inputN[5].value = '';
                this.inputN[6].value = '';
                this.inputN[7].value = '';

                this.inputTtq[0].value = '';
                this.inputTtq[1].value = '';
                this.inputTtq[2].value = '';
                this.inputTtq[3].value = '';
                this.inputTtq[4].value = '';
                this.inputTtq[5].value = '';
                this.inputTtq[6].value = '';
                this.inputTtq[7].value = '';

                this.inputB0[0].value = '';
                this.inputB0[1].value = '';
                this.inputB0[2].value = '';
                this.inputB0[3].value = '';
                this.inputB0[4].value = '';
                this.inputB0[5].value = '';
                this.inputB0[6].value = '';
                this.inputB0[7].value = '';

                this.inputB1[0].value = '';
                this.inputB1[1].value = '';
                this.inputB1[2].value = '';
                this.inputB1[3].value = '';
                this.inputB1[4].value = '';
                this.inputB1[5].value = '';
                this.inputB1[6].value = '';
                this.inputB1[7].value = '';

                this.inputB2[0].value = '';
                this.inputB2[1].value = '';
                this.inputB2[2].value = '';
                this.inputB2[3].value = '';
                this.inputB2[4].value = '';
                this.inputB2[5].value = '';
                this.inputB2[6].value = '';
                this.inputB2[7].value = '';

                this.inputB3[0].value = '';
                this.inputB3[1].value = '';
                this.inputB3[2].value = '';
                this.inputB3[3].value = '';
                this.inputB3[4].value = '';
                this.inputB3[5].value = '';
                this.inputB3[6].value = '';
                this.inputB3[7].value = '';

                this.inputB4[0].value = '';
                this.inputB4[1].value = '';
                this.inputB4[2].value = '';
                this.inputB4[3].value = '';
                this.inputB4[4].value = '';
                this.inputB4[5].value = '';
                this.inputB4[6].value = '';
                this.inputB4[7].value = '';

                this.transRats[0].value = '';
                this.transRats[1].value = '';
                this.transRats[2].value = '';
                this.transRats[3].value = '';
                this.transRats[4].value = '';
                this.transRats[5].value = '';
                this.transRats[6].value = '';
                this.transRats[7].value = '';

                this.mainRat.value = '';

                this.engineSpeeds[0].value = '';
                this.engineSpeeds[1].value = '';

                this.qid.value = "";

                this.mechEffi.value = '';

                this.radius.value = '';

                this.coeAir.value = '';

                this.area.value = '';

                this.quality.value = '';
            }

            if (this.presele.value == 1) {
                this.vehName.value = '大众 Golf V';
                this.coeAs[0].value = '358.440';
                this.coeAs[1].value = '-0.93242';
                this.coeAs[2].value = '1.241023e-3';
                this.coeAs[3].value = '-8.250183e-7';
                this.coeAs[4].value = '3.03616e-10';
                this.coeAs[5].value = '-6.24915e-14';
                this.coeAs[6].value = '6.71686e-18';
                this.coeAs[7].value = '-2.9334e-22';

                this.inputN[0].value = '850.0';
                this.inputN[1].value = '1500.0';
                this.inputN[2].value = '2000.0';
                this.inputN[3].value = '2500.0';
                this.inputN[4].value = '3735.0';
                this.inputN[5].value = '4500.0';
                this.inputN[6].value = '5250.0';
                this.inputN[7].value = '5800.0';

                this.inputTtq[0].value = "89.0561";
                this.inputTtq[1].value = "101.679";
                this.inputTtq[2].value = "108.0";
                this.inputTtq[3].value = "111.0";
                this.inputTtq[4].value = "125.827";
                this.inputTtq[5].value = "114.592";
                this.inputTtq[6].value = "98.2213";
                this.inputTtq[7].value = "80.0001";

                this.inputB0[0].value = '';
                this.inputB0[1].value = '';
                this.inputB0[2].value = '';
                this.inputB0[3].value = '';
                this.inputB0[4].value = '';
                this.inputB0[5].value = '';
                this.inputB0[6].value = '';
                this.inputB0[7].value = '';

                this.inputB1[0].value = '';
                this.inputB1[1].value = '';
                this.inputB1[2].value = '';
                this.inputB1[3].value = '';
                this.inputB1[4].value = '';
                this.inputB1[5].value = '';
                this.inputB1[6].value = '';
                this.inputB1[7].value = '';

                this.inputB2[0].value = '';
                this.inputB2[1].value = '';
                this.inputB2[2].value = '';
                this.inputB2[3].value = '';
                this.inputB2[4].value = '';
                this.inputB2[5].value = '';
                this.inputB2[6].value = '';
                this.inputB2[7].value = '';

                this.inputB3[0].value = '';
                this.inputB3[1].value = '';
                this.inputB3[2].value = '';
                this.inputB3[3].value = '';
                this.inputB3[4].value = '';
                this.inputB3[5].value = '';
                this.inputB3[6].value = '';
                this.inputB3[7].value = '';

                this.inputB4[0].value = '';
                this.inputB4[1].value = '';
                this.inputB4[2].value = '';
                this.inputB4[3].value = '';
                this.inputB4[4].value = '';
                this.inputB4[5].value = '';
                this.inputB4[6].value = '';
                this.inputB4[7].value = '';

                this.transRats[0].value = "3.77";
                this.transRats[1].value = "2.1";
                this.transRats[2].value = "1.39";
                this.transRats[3].value = "1.03";
                this.transRats[4].value = "0.81";
                this.transRats[5].value = "";
                this.transRats[6].value = "";
                this.transRats[7].value = "";

                this.mainRat.value = "4.782";

                this.engineSpeeds[0].value = "850";
                this.engineSpeeds[1].value = "5800";

                this.qid.value = "";

                this.mechEffi.value = "0.85";

                this.radius.value = "0.308";

                this.coeAir.value = "0.32";

                this.area.value = "2.22";

                this.quality.value = "1272.0";


            }
            if (this.presele.value == 2) {
                this.vehName.value = '沃尔沃 S80 D5';

                this.coeAs[0].value = '';
                this.coeAs[1].value = '';
                this.coeAs[2].value = '';
                this.coeAs[3].value = '';
                this.coeAs[4].value = '';
                this.coeAs[5].value = '';
                this.coeAs[6].value = '';
                this.coeAs[7].value = '';

                this.inputN[0].value = '850.0';
                this.inputN[1].value = '1500.0';
                this.inputN[2].value = '2000.0';
                this.inputN[3].value = '2500.0';
                this.inputN[4].value = '3000.0';
                this.inputN[5].value = '3500.0';
                this.inputN[6].value = '4000.0';
                this.inputN[7].value = '4600.0';

                this.inputTtq[0].value = '172.0';
                this.inputTtq[1].value = '302.0';
                this.inputTtq[2].value = '340.0';
                this.inputTtq[3].value = '340.0';
                this.inputTtq[4].value = '340.0';
                this.inputTtq[5].value = '316.491';
                this.inputTtq[6].value = '276.479';
                this.inputTtq[7].value = '242.884';

                this.inputB0[0].value = '';
                this.inputB0[1].value = '';
                this.inputB0[2].value = '';
                this.inputB0[3].value = '';
                this.inputB0[4].value = '';
                this.inputB0[5].value = '';
                this.inputB0[6].value = '';
                this.inputB0[7].value = '';

                this.inputB1[0].value = '';
                this.inputB1[1].value = '';
                this.inputB1[2].value = '';
                this.inputB1[3].value = '';
                this.inputB1[4].value = '';
                this.inputB1[5].value = '';
                this.inputB1[6].value = '';
                this.inputB1[7].value = '';

                this.inputB2[0].value = '';
                this.inputB2[1].value = '';
                this.inputB2[2].value = '';
                this.inputB2[3].value = '';
                this.inputB2[4].value = '';
                this.inputB2[5].value = '';
                this.inputB2[6].value = '';
                this.inputB2[7].value = '';

                this.inputB3[0].value = '';
                this.inputB3[1].value = '';
                this.inputB3[2].value = '';
                this.inputB3[3].value = '';
                this.inputB3[4].value = '';
                this.inputB3[5].value = '';
                this.inputB3[6].value = '';
                this.inputB3[7].value = '';

                this.inputB4[0].value = '';
                this.inputB4[1].value = '';
                this.inputB4[2].value = '';
                this.inputB4[3].value = '';
                this.inputB4[4].value = '';
                this.inputB4[5].value = '';
                this.inputB4[6].value = '';
                this.inputB4[7].value = '';

                this.transRats[0].value = '3.38983';
                this.transRats[1].value = '1.91';
                this.transRats[2].value = '1.19';
                this.transRats[3].value = '0.87';
                this.transRats[4].value = '0.65';
                this.transRats[5].value = '';
                this.transRats[6].value = '';
                this.transRats[7].value = '';

                this.mainRat.value = '3.77';

                this.engineSpeeds[0].value = '850';
                this.engineSpeeds[1].value = '4600';

                this.qid.value = "";

                this.mechEffi.value = '0.85';

                this.radius.value = '0.312';

                this.coeAir.value = '0.28';

                this.area.value = '2.25';

                this.quality.value = '1630.0';
            }
            if (this.presele.value == 3) {
                this.vehName.value = '蓝旗亚 Ypsilon 1.3';

                this.coeAs[0].value = '';
                this.coeAs[1].value = '';
                this.coeAs[2].value = '';
                this.coeAs[3].value = '';
                this.coeAs[4].value = '';
                this.coeAs[5].value = '';
                this.coeAs[6].value = '';
                this.coeAs[7].value = '';

                this.inputN[0].value = '850.0';
                this.inputN[1].value = '1500.0';
                this.inputN[2].value = '2000.0';
                this.inputN[3].value = '3000.0';
                this.inputN[4].value = '3500.0';
                this.inputN[5].value = '4000.0';
                this.inputN[6].value = '4500.0';
                this.inputN[7].value = '4800.0';

                this.inputTtq[0].value = '90.0';
                this.inputTtq[1].value = '170.0';
                this.inputTtq[2].value = '178.0';
                this.inputTtq[3].value = '145.205';
                this.inputTtq[4].value = '127.525';
                this.inputTtq[5].value = '108.0';
                this.inputTtq[6].value = '88.0';
                this.inputTtq[7].value = '75.6153';

                this.inputB0[0].value = '';
                this.inputB0[1].value = '';
                this.inputB0[2].value = '';
                this.inputB0[3].value = '';
                this.inputB0[4].value = '';
                this.inputB0[5].value = '';
                this.inputB0[6].value = '';
                this.inputB0[7].value = '';

                this.inputB1[0].value = '';
                this.inputB1[1].value = '';
                this.inputB1[2].value = '';
                this.inputB1[3].value = '';
                this.inputB1[4].value = '';
                this.inputB1[5].value = '';
                this.inputB1[6].value = '';
                this.inputB1[7].value = '';

                this.inputB2[0].value = '';
                this.inputB2[1].value = '';
                this.inputB2[2].value = '';
                this.inputB2[3].value = '';
                this.inputB2[4].value = '';
                this.inputB2[5].value = '';
                this.inputB2[6].value = '';
                this.inputB2[7].value = '';

                this.inputB3[0].value = '';
                this.inputB3[1].value = '';
                this.inputB3[2].value = '';
                this.inputB3[3].value = '';
                this.inputB3[4].value = '';
                this.inputB3[5].value = '';
                this.inputB3[6].value = '';
                this.inputB3[7].value = '';

                this.inputB4[0].value = '';
                this.inputB4[1].value = '';
                this.inputB4[2].value = '';
                this.inputB4[3].value = '';
                this.inputB4[4].value = '';
                this.inputB4[5].value = '';
                this.inputB4[6].value = '';
                this.inputB4[7].value = '';

                this.transRats[0].value = '3.08929';
                this.transRats[1].value = '2.24';
                this.transRats[2].value = '1.44';
                this.transRats[3].value = '1.03';
                this.transRats[4].value = '0.77';
                this.transRats[5].value = '';
                this.transRats[6].value = '';
                this.transRats[7].value = '';

                this.mainRat.value = '3.35';

                this.engineSpeeds[0].value = '850';
                this.engineSpeeds[1].value = '4800';

                this.qid.value = "";

                this.mechEffi.value = '0.85';

                this.radius.value = '0.301';

                this.coeAir.value = '0.32';

                this.area.value = '2.1';

                this.quality.value = '1172.0';
            }
            if (this.presele.value == 4) {
                this.vehName.value = '某轻型货车';

                this.coeAs[0].value = '-19.313';
                this.coeAs[1].value = '0.29527';
                this.coeAs[2].value = '-1.6544e-4';
                this.coeAs[3].value = '4.0874e-8';
                this.coeAs[4].value = '-3.8445e-12';
                this.coeAs[5].value = '';
                this.coeAs[6].value = '';
                this.coeAs[7].value = '';

                this.inputN[0].value = '815';
                this.inputN[1].value = '1207';
                this.inputN[2].value = '1614';
                this.inputN[3].value = '2012';
                this.inputN[4].value = '2603';
                this.inputN[5].value = '3006';
                this.inputN[6].value = '3403';
                this.inputN[7].value = '3804';

                // this.inputTtq[0].value = "132";
                // this.inputTtq[1].value = "159.5";
                // this.inputTtq[2].value = "172";
                // this.inputTtq[3].value = "175";
                // this.inputTtq[4].value = "172.8";
                // this.inputTtq[5].value = "169.6";
                // this.inputTtq[6].value = "164";
                // this.inputTtq[7].value = "154.5";

                this.inputTtq[0].value = '';
                this.inputTtq[1].value = '';
                this.inputTtq[2].value = '';
                this.inputTtq[3].value = '';
                this.inputTtq[4].value = '';
                this.inputTtq[5].value = '';
                this.inputTtq[6].value = '';
                this.inputTtq[7].value = '';

                this.inputB0[0].value = "1326.8";
                this.inputB0[1].value = "1354.7";
                this.inputB0[2].value = "1284.4";
                this.inputB0[3].value = "1122.9";
                this.inputB0[4].value = "1141.0";
                this.inputB0[5].value = "1051.2";
                this.inputB0[6].value = "1233.9";
                this.inputB0[7].value = "1129.7";

                this.inputB1[0].value = "-416.46";
                this.inputB1[1].value = "-303.98";
                this.inputB1[2].value = "-189.75";
                this.inputB1[3].value = "-121.59";
                this.inputB1[4].value = "-98.893";
                this.inputB1[5].value = "-73.714";
                this.inputB1[6].value = "-84.478";
                this.inputB1[7].value = "-45.291";

                this.inputB2[0].value = "72.379";
                this.inputB2[1].value = "36.657";
                this.inputB2[2].value = "14.524";
                this.inputB2[3].value = "7.0035";
                this.inputB2[4].value = "4.4763";
                this.inputB2[5].value = "2.8593";
                this.inputB2[6].value = "2.9788";
                this.inputB2[7].value = "0.71113";

                this.inputB3[0].value = "-5.8629";
                this.inputB3[1].value = "-2.0553";
                this.inputB3[2].value = "-0.51184";
                this.inputB3[3].value = "-0.18517";
                this.inputB3[4].value = "-0.091077";
                this.inputB3[5].value = "-0.05138";
                this.inputB3[6].value = "-0.047449";
                this.inputB3[7].value = "-7.5215e-4";

                this.inputB4[0].value = "0.17768";
                this.inputB4[1].value = "0.043072";
                this.inputB4[2].value = "6.8164e-3";
                this.inputB4[3].value = "1.8555e-3";
                this.inputB4[4].value = "6.8906e-4";
                this.inputB4[5].value = "3.5032e-4";
                this.inputB4[6].value = "2.8230e-4";
                this.inputB4[7].value = "-3.8568e-5";

                this.transRats[0].value = "5.56";
                this.transRats[1].value = "2.769";
                this.transRats[2].value = "1.644";
                this.transRats[3].value = "1.00";
                this.transRats[4].value = "0.793";
                this.transRats[5].value = "";
                this.transRats[6].value = "";
                this.transRats[7].value = "";

                this.mainRat.value = "5.83";

                this.engineSpeeds[0].value = "600";
                this.engineSpeeds[1].value = "4000";

                this.qid.value = "0.299";

                this.mechEffi.value = "0.85";

                this.radius.value = "0.367";

                this.coeAir.value = "0.32";

                this.area.value = "8.65";

                this.quality.value = "3880.0";


            }


        }

        getData() {
            this.dtNTtqs.splice(0, this.dtNTtqs.length); //清除数组
            for (let i = 0; i < 8; i++) {
                this.dtNTtqs.push([parseFloat(this.inputN[i].value), parseFloat(this.inputTtq[i].value)]) //转速对应转矩数据
            }
            this.dtNTtqs = this.dtNTtqs.delNaN(); //清除成对的nan数组元素


            if (this.checkRadio() == 0) {
                this.dtCoeAs.splice(0, this.dtCoeAs.length);
                for (let i = 0; i < this.coeAs.length; i++) {
                    if (this.coeAs[i].value != '')
                        this.dtCoeAs.push(parseFloat(this.coeAs[i].value))
                }

            } else if (this.checkRadio() == 1) {
                this.dtCoeAs = math.multiply(this.inv(this.nSquare()), this.ttqSquare()); //拟合得到的系数
            }





            this.dtEngineSpeeds.splice(0, this.dtEngineSpeeds.length);
            for (let i = 0; i < this.engineSpeeds.length; i++) {
                this.dtEngineSpeeds.push(parseFloat(this.engineSpeeds[i].value));
            } //发动机转速范围
            this.dtEngineSpeeds = this.dtEngineSpeeds.delNaN();
            // if (this.dtEngineSpeeds.length < 2) { return alert('缺少 发动机转速范围\n可选择预选输入参数'); }

            this.dtNBs.splice(0, this.dtNBs.length); //清除数组
            for (let i = 0; i < 8; i++) {
                this.dtNBs.push([parseFloat(this.inputN[i].value), parseFloat(this.inputB0[i].value), parseFloat(this.inputB1[i].value), parseFloat(this.inputB2[i].value), parseFloat(this.inputB3[i].value), parseFloat(this.inputB4[i].value)]) //转速对应拟合系数数据
            }
            this.dtNBs = this.dtNBs.delNaNs(); //清除成对的nan数组元素


            if (this.dtNBs.length == 8) { //禁用燃油相关曲线
                this.optPlots[9].disabled = false;
                this.optPlots[10].disabled = false;
            } else if (this.dtNBs.length == 0) {
                this.optPlots[9].disabled = true;
                this.optPlots[10].disabled = true;
                // alert('燃油消耗率系数数据组为空，将不会生成 百公里燃油消耗量曲线、90km/h百公里燃油消耗量、发动机负荷特性曲线');
            } else {
                this.optPlots[9].disabled = false;
                this.optPlots[10].disabled = true;
                // alert('燃油消耗率系数数据组不全，将不会生成 百公里燃油消耗量曲线、90km/h百公里燃油消耗量');

            }

            this.dtTransRats.splice(0, this.dtTransRats.length);
            for (let i = 0; i < this.transRats.length; i++) {
                this.dtTransRats.push(parseFloat(this.transRats[i].value));
            } //各档传动比
            this.dtTransRats = this.dtTransRats.delNaN(); //清除nan数组元素
            this.dtMainRat = parseFloat(this.mainRat.value); //主减速比
            this.dtMechEffi = parseFloat(this.mechEffi.value); //传动效率
            this.dtRadius = parseFloat(this.radius.value); //车轮半径
            this.dtCoeAir = parseFloat(this.coeAir.value); //空阻系数
            this.dtArea = parseFloat(this.area.value); //迎风面积
            this.dtQuality = parseFloat(this.quality.value); //整车质量
            this.selePlot.disabled = false;


        }

        changePlot(that) {
            if (that.checkRadio() == 0) {
                if (that.dtCoeAs.length <= 3) return alert('拟合系数模式下,至少输入3个拟合系数 发动机转速范围\n可选择预选输入参数');
            }
            if (that.checkRadio() == 1) {
                if (that.dtNTtqs.length < 3 || that.dtEngineSpeeds.length < 2) return alert('转速转矩拟合模式下,至少输入3组发动机转矩-转速数据 和 发动机转速范围\n可选择预选输入参数');
            }


            if (this.value == 0) {
                that.putEnginePlot();
            }
            if (this.value == 1) {
                that.putBPlot();
            }
            if (this.value == 2) {
                that.putFPlot();
            }
            if (this.value == 3) {
                that.putPPlot();
            }
            if (this.value == 4) {
                that.putPPPlot();
            }
            if (this.value == 5) {
                that.putAPlot();
            }
            if (this.value == 6) {
                that.putAAPlot();
            }
            if (this.value == 7) {
                that.putIPlot();
            }
            if (this.value == 8) {
                that.putRadar();
            }
            if (this.value == 9) {
                that.putTPlot();
            }
            if (this.value == 10) {
                that.putQsPlot();
            }
            if (this.value == 11) {
                that.putCirPlot();
            }

        }

        putEnginePlot() {
            this.enginePlot.title.text = `${this.vehName.value} 发动机 外特性功率-转矩曲线`;
            this.enginePlot.series[0].data = this.peData();
            this.enginePlot.series[1].data = this.ttqData();
            this.myChart.setOption(this.enginePlot, true);
        }

        putFPlot() {
            this.fPlot.title.text = `${this.vehName.value} 汽车 驱动力-行驶阻力平衡图`;
            this.fPlot.series[0].data = this.fffwData();
            for (let i = 0; i < this.transRats.length; i++) {
                this.fPlot.series[i + 1].name = ``;
                this.fPlot.series[i + 1].data = '';
            }
            for (let i = 0; i < this.dtTransRats.length; i++) {
                this.fPlot.series[i + 1].name = `Ft${i+1}`;
                this.fPlot.series[i + 1].data = this.ftUaData(i);
            }

            this.myChart.setOption(this.fPlot, true);
        }

        putPPlot() {
            this.pPlot.title.text = `${this.vehName.value} 汽车 功率平衡图`;
            this.pPlot.series[0].data = this.pfPwData();
            for (let i = 0; i < this.transRats.length; i++) {
                this.pPlot.series[i + 1].name = ``;
                this.pPlot.series[i + 1].data = '';
            }
            for (let i = 0; i < this.dtTransRats.length; i++) {
                this.pPlot.series[i + 1].name = `Pe${i+1}`;
                this.pPlot.series[i + 1].data = this.peUaData(i);
            }

            this.myChart.setOption(this.pPlot, true);
        }

        putPPPlot() {
            this.ppPlot.title.text = `${this.vehName.value} 汽车 后备功率曲线`;
            for (let i = 0; i < this.transRats.length; i++) {
                this.ppPlot.series[i].name = ``;
                this.ppPlot.series[i].data = '';
            }
            for (let i = 0; i < this.dtTransRats.length; i++) {
                this.ppPlot.series[i].name = `Pe${i+1}`;
                this.ppPlot.series[i].data = this.ppeUaData(i);
            }

            this.myChart.setOption(this.ppPlot, true);
        }

        putAPlot() {
            this.aPlot.title.text = `${this.vehName.value} 汽车 加速度曲线`;
            for (let i = 0; i < this.transRats.length; i++) {
                this.aPlot.series[i].name = ``;
                this.aPlot.series[i].data = '';
            }
            for (let i = 0; i < this.dtTransRats.length; i++) {
                this.aPlot.series[i].name = `a${i+1}`;
                this.aPlot.series[i].data = this.aUaData(i);
            }

            this.myChart.setOption(this.aPlot, true);
        }
        putAAPlot() {
            this.aaPlot.title.text = `${this.vehName.value} 汽车 加速度倒数曲线`;

            for (let i = 0; i < this.transRats.length; i++) {
                this.aaPlot.series[i].name = ``;
                this.aaPlot.series[i].data = '';
            }
            for (let i = 0; i < this.dtTransRats.length; i++) {
                this.aaPlot.series[i].name = `1/a${i+1}`;
                this.aaPlot.series[i].data = this.aaUaData(i);
            }

            this.myChart.setOption(this.aaPlot, true);
        }

        putIPlot() {
            this.iPlot.title.text = `${this.vehName.value} 汽车 爬坡度曲线`;
            for (let i = 0; i < this.transRats.length; i++) {
                this.iPlot.series[i].name = '';
                this.iPlot.series[i].data = '';
            }
            for (let i = 0; i < this.dtTransRats.length; i++) {
                this.iPlot.series[i].name = `${i+1}档`;
                this.iPlot.series[i].data = this.iUaData(i);
            }

            this.myChart.setOption(this.iPlot, true);
        }

        putBPlot() {
            this.bPlot.title.text = `${this.vehName.value} 发动机 负荷特性`;
            for (let i = 0; i < 8; i++) {
                this.bPlot.series[i].name = ``;
                this.bPlot.series[i].data = '';
            }
            for (let i = 0; i < this.dtNBs.length; i++) {
                this.bPlot.series[i].name = `b${this.dtNBs[i][0]}`;
                this.bPlot.series[i].data = this.bPeData(i);
            }

            this.myChart.setOption(this.bPlot, true);
        }

        putRadar() {
            this.radar.title.text = `${this.vehName.value} 综合性能雷达图`;

            this.radar.radar.indicator[0].name = `最高车速(km/h)`;
            this.radar.radar.indicator[1].name = `最大爬坡度(1/%),对应车速${this.iUaMaxData(0)[0]}(km/h)`;
            this.radar.radar.indicator[2].name = `峰值扭矩(N.m),对应转速${this.ttqMaxData()[0]}(r/min)`;
            this.radar.radar.indicator[3].name = `峰值功率(kw),对应转速${this.peMaxData()[0]}(r/min)`;
            this.radar.radar.indicator[4].name = `0——100加速时间(s)`;
            this.radar.radar.indicator[5].name = `90km/h百公里燃油消耗量(L/100km)`;
            this.radar.radar.indicator[6].name = `NEDC百公里燃油消耗量(L/100km)`;
            this.radar.series[0].data[0].value = [, , , , , ];


            this.radar.radar.indicator[0].name = `最高车速(km/h)`;
            this.radar.radar.indicator[1].name = `最大爬坡度(1/%),对应车速${this.iUaMaxData(0)[0]}(km/h)`;
            this.radar.radar.indicator[2].name = `峰值扭矩(N.m),对应转速${this.ttqMaxData()[0]}(r/min)`;
            this.radar.radar.indicator[3].name = `峰值功率(kw),对应转速${this.peMaxData()[0]}(r/min)`;
            this.radar.radar.indicator[4].name = `0——100加速时间(s)`;
            this.radar.radar.indicator[5].name = `90km/h百公里燃油消耗量(L/100km)`;
            this.radar.radar.indicator[6].name = `NEDC百公里燃油消耗量(L/100km)`;
            if (this.dtNBs.length == 8) {
                this.radar.series[0].data[0].value = [this.UaMaxData(this.dtTransRats.length - 1), this.iUaMaxData(0)[1], this.ttqMaxData()[1], this.peMaxData()[1], this.tUaData(), this.qsFun(90, this.dtTransRats.length - 1), this.qSixResult()];
            } else {
                this.radar.series[0].data[0].value = [this.UaMaxData(this.dtTransRats.length - 1), this.iUaMaxData(0)[1], this.ttqMaxData()[1], this.peMaxData()[1], this.tUaData(), ];

            }
            this.myChart.setOption(this.radar, true);
        }

        putTPlot() {
            this.tPlot.title.text = `${this.vehName.value} 汽车 加速时间曲线`;

            this.tPlot.series[0].name = ``;
            this.tPlot.series[0].data = '';

            this.tPlot.series[0].name = `加速时间`;
            this.tPlot.series[0].data = this.aafUaData();

            this.myChart.setOption(this.tPlot, true);
        }

        putCirPlot() {
            this.cirPlot.title.text = `${this.vehName.value} 汽车 NEDC循环工况测试曲线`;

            this.cirPlot.series[0].name = ``;
            this.cirPlot.series[0].data = '';

            this.cirPlot.series[0].name = `车速`;
            this.cirPlot.series[0].data = this.nedcData();

            this.myChart.setOption(this.cirPlot, true);
        }

        putQsPlot() {
            this.qsPlot.title.text = `${this.vehName.value} 汽车 等速燃油消耗量`;

            for (let i = 0; i < this.transRats.length; i++) {
                this.qsPlot.series[i].name = ``;;
                this.qsPlot.series[i].data = '';
            }
            for (let i = 0; i < this.dtTransRats.length; i++) {
                this.qsPlot.series[i].name = `${i+1}挡`;;
                this.qsPlot.series[i].data = this.qsData(i);
            }

            this.myChart.setOption(this.qsPlot, true);
        }



        // testFun() {//用于开发测试
        //     console.log(this.iPlot.series[1].demo);
        // }

        //函数计算部分start

        nSquare() { //转速矩阵数据
            var square = new Array(); //声明一维
            for (var i = 0; i < this.dtNTtqs.length; i++) { //一维长度
                square[i] = new Array(i); //声明二维
                for (var j = 0; j < this.dtNTtqs.length; j++) { //二维长度
                    square[i][j] = Math.pow(this.dtNTtqs[i][0], j);
                }
            }
            return square;
        }

        ttqSquare() { //转矩矩阵数据
            let square = [];
            for (let i = 0; i < this.dtNTtqs.length; i++) {
                square[i] = this.dtNTtqs[i][1];
            }
            return square;
        }

        ttqFun(n) { //转矩函数
            let ttq = 0;

            if (this.checkRadio() == 0) {
                for (let j = 0; j < this.dtCoeAs.length; j++) {
                    ttq += this.dtCoeAs[j] * Math.pow(n, j);
                }
                return Math.round(parseFloat(ttq) * 100) / 100; //保留两位小数
            } else if (this.checkRadio() == 1) {
                for (let j = 0; j < this.dtNTtqs.length; j++) {
                    ttq += this.dtCoeAs[j] * Math.pow(n, j);
                }
                return Math.round(parseFloat(ttq) * 100) / 100; //保留两位小数
            }

        }

        ttqData() { //转矩数据
            let data = [];
            for (let n = this.dtEngineSpeeds[0]; n <= this.dtEngineSpeeds[1]; n += 10) {
                data.push([n, this.ttqFun(n)]);
            }
            return data;
        }
        ttqMaxData() { //发动机最大转矩和其车速
            let data = [];
            let max = 0;
            for (let n = this.dtEngineSpeeds[0]; n <= this.dtEngineSpeeds[1]; n += 10) {
                if (this.ttqFun(n) > max) {
                    data.push(n);
                    data.push(this.ttqFun(n));
                    max = this.ttqFun(n);
                }
            }
            return [data[data.length - 2], data[data.length - 1]];
        }

        bPeFun(pe, n0) { //各档燃油消耗率函数
            let b = 0;
            for (let i = 0; i < 5; i++) {
                b += this.dtNBs[n0][i + 1] * Math.pow(pe, i)
            }
            return Math.round(b * 100) / 100;
        }
        bPeData(n0) { //各档燃油消耗率数据
            let data = [];
            for (let pe = 2; pe <= this.peFun(this.dtNBs[n0][0]); pe += 0.2) {
                data.push([pe, this.bPeFun(pe, n0)]);
            }
            return data;
        }

        bFun(ua, i) { //算出对应车速,对应档位的燃油消耗率系数
            let x;
            let b = [];
            let n = this.nUaFun(ua, i);
            if (this.dtNBs[0][0] > n || this.dtNBs[this.dtNBs.length - 1][0] < n) {
                alert('该车速对应发动机转速未包含在输入的燃油消耗率拟合数据组中，无法计算百公里燃油消耗量曲线')
                return;
            }
            for (let i = 0; i < this.dtNBs.length; i++) {
                if (this.dtNBs[i][0] < n && this.dtNBs[i + 1][0] > n) {
                    x = (this.dtNBs[i][0] - n) / (this.dtNBs[i][0] - this.dtNBs[i + 1][0]);
                    b[0] = this.dtNBs[i][1] - x * (this.dtNBs[i][1] - this.dtNBs[i + 1][1])
                    b[1] = this.dtNBs[i][2] - x * (this.dtNBs[i][2] - this.dtNBs[i + 1][2])
                    b[2] = this.dtNBs[i][3] - x * (this.dtNBs[i][3] - this.dtNBs[i + 1][3])
                    b[3] = this.dtNBs[i][4] - x * (this.dtNBs[i][4] - this.dtNBs[i + 1][4])
                    b[4] = this.dtNBs[i][5] - x * (this.dtNBs[i][5] - this.dtNBs[i + 1][5])
                    return b;
                }

            }
        }
        bbPeFun(ua, i) { //对应车速的对应档位车速的燃油消耗率
            let b;
            b = this.bFun(ua, i)[0] + this.bFun(ua, i)[1] * this.pfPwFun(ua) + this.bFun(ua, i)[2] * Math.pow(this.pfPwFun(ua), 2) + this.bFun(ua, i)[3] * Math.pow(this.pfPwFun(ua), 3) + this.bFun(ua, i)[4] * Math.pow(this.pfPwFun(ua), 4);
            return Math.round(b * 100) / 100;
        }

        uaTFun(t) { //六工况循环函数
            let ua = 0;
            if (0 <= t && t <= 7.2) {
                ua = 25;
            } else if (7.2 < t && t <= 23.9) {
                ua = 25 + (40 - 25) / (23.9 - 7.2) * (t - 7.2);
            } else if (23.9 < t && t <= 46.4) {
                ua = 40;
            } else if (46.4 < t && t <= 60.4) {
                ua = 40 + (50 - 40) / (60.4 - 46.4) * (t - 46.4);
            } else if (60.4 < t && t <= 78.4) {
                ua = 50;
            } else if (78.4 < t && t <= 97.7) {
                ua = 50 + (25 - 50) / (97.7 - 78.4) * (t - 78.4);
            }
            return Math.round(ua * 100) / 100;;
        }

        nedcFun(t) { //nedc循环工况函数
            let point = [];
            point.push([0, 0]);
            point.push([11, 0]);
            point.push([15, 15]);
            point.push([23, 15]);
            point.push([28, 0]);
            point.push([50, 0]);
            point.push([61, 23]);
            point.push([85, 23]);
            point.push([100, 0]);
            point.push([117, 0]);
            point.push([142, 50]);
            point.push([155, 50]);
            point.push([163, 35]);
            point.push([176, 35]);
            point.push([188, 0]);
            point.push([195, 0]);

            point.push([195 + 0, 0]);
            point.push([195 + 11, 0]);
            point.push([195 + 15, 15]);
            point.push([195 + 23, 15]);
            point.push([195 + 28, 0]);
            point.push([195 + 50, 0]);
            point.push([195 + 61, 23]);
            point.push([195 + 85, 23]);
            point.push([195 + 100, 0]);
            point.push([195 + 117, 0]);
            point.push([195 + 142, 50]);
            point.push([195 + 155, 50]);
            point.push([195 + 163, 35]);
            point.push([195 + 176, 35]);
            point.push([195 + 188, 0]);
            point.push([195 + 195, 0]);

            point.push([195 + 195 + 0, 0]);
            point.push([195 + 195 + 11, 0]);
            point.push([195 + 195 + 15, 15]);
            point.push([195 + 195 + 23, 15]);
            point.push([195 + 195 + 28, 0]);
            point.push([195 + 195 + 50, 0]);
            point.push([195 + 195 + 61, 23]);
            point.push([195 + 195 + 85, 23]);
            point.push([195 + 195 + 100, 0]);
            point.push([195 + 195 + 117, 0]);
            point.push([195 + 195 + 142, 50]);
            point.push([195 + 195 + 155, 50]);
            point.push([195 + 195 + 163, 35]);
            point.push([195 + 195 + 176, 35]);
            point.push([195 + 195 + 188, 0]);
            point.push([195 + 195 + 195, 0]);

            point.push([195 + 195 + 195 + 0, 0]);
            point.push([195 + 195 + 195 + 11, 0]);
            point.push([195 + 195 + 195 + 15, 15]);
            point.push([195 + 195 + 195 + 23, 15]);
            point.push([195 + 195 + 195 + 28, 0]);
            point.push([195 + 195 + 195 + 50, 0]);
            point.push([195 + 195 + 195 + 61, 23]);
            point.push([195 + 195 + 195 + 85, 23]);
            point.push([195 + 195 + 195 + 100, 0]);
            point.push([195 + 195 + 195 + 117, 0]);
            point.push([195 + 195 + 195 + 142, 50]);
            point.push([195 + 195 + 195 + 155, 50]);
            point.push([195 + 195 + 195 + 163, 35]);
            point.push([195 + 195 + 195 + 176, 35]);
            point.push([195 + 195 + 195 + 188, 0]);
            point.push([195 + 195 + 195 + 195, 0]);


            point.push([800, 0]);
            point.push([840, 70]);
            point.push([891, 70]);
            point.push([899, 50]);
            point.push([968, 50]);
            point.push([981, 70]);
            point.push([1031, 70]);
            point.push([1066, 100]);
            point.push([1096, 100]);
            point.push([1116, 120]);
            point.push([1126, 120]);
            point.push([1160, 0]);
            point.push([1180, 0]);


            let fun = 0;
            for (i = 0; i < point.length; i++) {
                if (point[i][0] < t && t <= point[i + 1][0]) {
                    fun = (t - point[i][0]) * (point[i + 1][1] - point[i][1]) / (point[i + 1][0] - point[i][0]) + point[i][1];
                } //y = (y2-y1)/(x2-x1)*(x-x1)+y1（两点式）
            }
            return Math.round(fun * 100) / 100;

        }

        nedcData() {
            let data = [];
            for (let t = 0; t <= 1180; t += 0.1) {
                t = Math.round(t * 10) / 10;
                data.push([t, this.nedcFun(t)]);
            }
            return data;
        }

        uaTData() { //六工况循环数据
            let data = [];
            for (let t = 0; t <= 97.7; t += 0.1) {
                data.push([t, this.uaTFun(t)]);
            }
            return data;
        }

        qtFun(t, i) { //单位时间燃油消耗量函数
            let qt;
            qt = this.bbPeFun(this.uaTFun(t), i) * this.pfPwFun(this.uaTFun(t)) / (367.1 * this.dtrou * this.dtG);
            return Math.round(qt * 100) / 100;
        }

        qSixResult() { //六工况循环油耗
            let q = 0;
            let s = 0; //单位为km
            let result;
            for (let t = 0; t <= 97.7; t += 1) {
                q += this.qtFun(t, 3);
                s += this.uaTFun(t) / 3.6;
            }
            result = q * 100 / s;
            return Math.round(result * 100) / 100;
        }


        qsFun(ua, i) { //百公里燃油消耗量函数
            let qs;
            qs = this.bbPeFun(ua, i) * this.pfPwFun(ua) / (1.02 * ua * this.dtrou * this.dtG);
            return Math.round(qs * 100) / 100;
        }

        qsData(i) { //对应档位的燃油消耗量曲线
            let data = [];
            for (let ua = this.uaMiFun(i) + 1; ua <= this.uaMaFun(i) - 1; ua += 1) {
                data.push([ua, this.qsFun(ua, i)]);
            }
            return data;
        }

        uaMaFun(i) { //对应档位的最高车速（拟合系数输入框）
            let uaMax = 0.377 * this.dtRadius * this.dtNBs[this.dtNBs.length - 1][0] / (this.dtMainRat * this.dtTransRats[i]);
            return Math.round(uaMax);
        }
        uaMiFun(i) { //对应档位的最低车速（拟合系数输入框）
            let uaMax = 0.377 * this.dtRadius * this.dtNBs[0][0] / (this.dtMainRat * this.dtTransRats[i]);
            return Math.round(uaMax);
        }

        peFun(n) { //功率函数
            let pe = this.ttqFun(n) * n / 9550
            return Math.round(pe * 100) / 100;
        }

        peData() { //功率数据
            let data = [];
            for (let n = this.dtEngineSpeeds[0]; n <= this.dtEngineSpeeds[1]; n += 10) {
                data.push([n, this.peFun(n)]);
            }
            return data;
        }

        peMaxData() { //发动机最大功率和其转速
            let data = [];
            let max = 0;
            for (let n = this.dtEngineSpeeds[0]; n <= this.dtEngineSpeeds[1]; n += 10) {
                if (this.peFun(n) > max) {
                    data.push(n);
                    data.push(this.peFun(n));
                    max = this.peFun(n);
                }
            }
            return [data[data.length - 2], data[data.length - 1]];
        }


        uaMinFun(i) { //对应档位的最低车速
            let uaMin = 0.377 * this.dtRadius * this.dtEngineSpeeds[0] / (this.dtMainRat * this.dtTransRats[i]);
            return Math.round(uaMin);
        }

        uaMaxFun(i) { //对应档位的最高车速
            let uaMan = 0.377 * this.dtRadius * this.dtEngineSpeeds[1] / (this.dtMainRat * this.dtTransRats[i]);
            return Math.round(uaMan);
        }

        nUaFun(ua, i) { //第i档位转速和车速的关系
            let n = this.dtMainRat * this.dtTransRats[i] * ua / (0.377 * this.dtRadius)
            return n;
        }

        ttqUaFun(ua, i) { //各档转矩和车速函数
            let ttq = 0;
            for (let j = 0; j < this.dtCoeAs.length; j++) {
                ttq += this.dtCoeAs[j] * Math.pow(this.nUaFun(ua, i), j);
            }
            // let ttq = this.dtCoeAs[0] + this.dtCoeAs[1] * this.nUaFun(ua, i) + this.dtCoeAs[2] * Math.pow(this.nUaFun(ua, i), 2) + this.dtCoeAs[3] * Math.pow(this.nUaFun(ua, i), 3) + this.dtCoeAs[4] * Math.pow(this.nUaFun(ua, i), 4) + this.dtCoeAs[5] * Math.pow(this.nUaFun(ua, i), 5);
            return ttq;
        }

        ftUaFun(ua, i) { //各档驱动力和车速函数
            let ft = this.ttqUaFun(ua, i) * this.dtMainRat * this.dtTransRats[i] * this.dtMechEffi / this.dtRadius;
            return Math.round(ft);
        }

        ftUaData(i) { //各档驱动力和车速数据
            let data = [];
            for (let ua = this.uaMinFun(i); ua <= this.uaMaxFun(i); ua += 1) {
                data.push([ua, this.ftUaFun(ua, i)]);
            }
            return data;
        }

        peUaFun(ua, i) { //各档发动机功率和车速函数
            let peUa = this.ttqUaFun(ua, i) * this.nUaFun(ua, i) / 9550;
            return Math.round(peUa * 100) / 100;
        }

        peUaData(i) { //各档功率和车速数据
            let data = [];
            for (let ua = this.uaMinFun(i); ua <= this.uaMaxFun(i); ua += 1) {
                data.push([ua, this.peUaFun(ua, i)]);
            }
            return data;
        }

        ppeUaFun(ua, i) { //各档发动机后备功率和车速函数
            let peUa = this.ttqUaFun(ua, i) * this.nUaFun(ua, i) / 9550 - this.pfPwFun(ua);
            return Math.round(peUa * 100) / 100;
        }

        ppeUaData(i) { //各档后备功率和车速数据
            let data = [];
            for (let ua = this.uaMinFun(i); ua <= this.uaMaxFun(i); ua += 1) {
                if (this.ppeUaFun(ua, i) >= 0) {
                    data.push([ua, this.ppeUaFun(ua, i)]);
                }
            }
            return data;
        }

        UaMaxData(i) { //最大车速，考虑阻力
            let data = [];
            for (let ua = this.uaMinFun(i); ua <= this.uaMaxFun(i); ua += 1) {
                if (this.ppeUaFun(ua, i) >= 0) {
                    data.push(ua);
                }
            }
            return data[data.length - 1];
        }

        delta(i) { //各档位的旋转质量转换系数,仅供书中例子使用
            let result = 1;
            switch (i) {
                case 0:
                    result = 1.3829;
                    break;
                case 1:
                    result = 1.1027;
                    break;
                case 2:
                    result = 1.0429;
                    break;
                case 3:
                    result = 1.0224;
                    break;
                case 4:
                    result = 1.0179;
                    break;
                default:
                    result = 1;
            }
            return result;
        }
        aUaFun(ua, i) { //各档加速度和车速函数
            let a = (this.ftUaFun(ua, i) - this.ffFun(ua) - this.fwFun(ua)) / (this.dtQuality * this.delta(i));
            return Math.round(a * 1000) / 1000;
        }


        aaUaFun(ua, i) { //各档加速度倒数和车速函数
            let a = 1 / this.aUaFun(ua, i);
            return Math.round(a * 1000) / 1000;
        }

        aUaData(i) { //各档加速度和车速数据
            let data = [];
            for (let ua = this.uaMinFun(i); ua <= this.uaMaxFun(i); ua += 1) {
                if (this.aUaFun(ua, i) > 0) {
                    data.push([ua, this.aUaFun(ua, i)]);
                }
            }
            return data;
        }
        aaUaData(i) { //各档加速度倒数和车速数据
            let data = [];
            for (let ua = this.uaMinFun(i); ua <= this.uaMaxFun(i); ua += 1) {
                if (this.aUaFun(ua, i) > 0.1) {
                    data.push([ua, this.aaUaFun(ua, i)]);
                }

            }
            return data;
        }

        aafUaFun(ua, i) { //各档加速度倒数(力计算中包括阻力)和车速函数
            let aa = 1 / (((this.ftUaFun(ua, i) - this.fffwFun(ua)) / this.dtQuality) * 3.6);
            return aa;
        }

        aafUaData() { //各档加速度倒数(力计算中包括阻力)和车速数据
            let data = [],
                i = 0,
                t = 0;
            for (let ua = this.uaMinFun(0); ua <= this.UaMaxData(this.dtTransRats.length - 1); ua += 1) {
                if (i < (this.dtTransRats.length - 1) && this.ftUaFun(ua, i + 1) > this.ftUaFun(ua, i)) {
                    i++;
                }
                t += this.aafUaFun(ua, i);
                data.push([ua, Math.round(t * 100) / 100]);
            }
            return data;
        }

        tUaData() { //0-100加速时间
            let
                i = 0,
                t = 0;
            for (let ua = this.uaMinFun(0); ua <= 100; ua += 1) {
                if (i < (this.dtTransRats.length - 1) && this.ftUaFun(ua, i + 1) > this.ftUaFun(ua, i)) {
                    i++;
                }
                t += this.aafUaFun(ua, i);

            }
            return Math.round(t * 100) / 100;
        }

        iUaFun(ua, i) { //各档爬坡度和车速函数
            let iUa = Math.tan(Math.asin((this.ftUaFun(ua, i) - this.ffFun(ua) - this.fwFun(ua)) / (this.dtQuality * this.dtG)));
            return Math.round(iUa * 1000) / 10;
        }

        iUaData(i) { //各档爬坡度和车速数据
            let data = [];
            for (let ua = this.uaMinFun(i); ua <= this.uaMaxFun(i); ua += 1) {
                if (this.iUaFun(ua, i) >= 0) {
                    data.push([ua, this.iUaFun(ua, i)]);
                }
            }
            return data;
        }

        iUaMaxData(i) { //对应档位的最大爬坡度和其车速
            let data = [];
            let max = 0;
            for (let ua = this.uaMinFun(i); ua <= this.uaMaxFun(i); ua += 1) {
                if (this.iUaFun(ua, i) > max) {
                    data.push(ua);
                    data.push(this.iUaFun(ua, i));
                    max = this.iUaFun(ua, i);
                }
            }
            return [data[data.length - 2], data[data.length - 1]];
        }

        fCoeFun(ua) { //滚阻系数函数
            let fCoe = 0.0041 + 0.0000256 * ua; //此公式为经验公式
            return fCoe;
        }

        ffFun(ua) { //滚阻函数
            let ff = this.dtQuality * this.dtG * this.fCoeFun(ua);
            return Math.round(ff);
        }

        // ffData() { //滚阻数据
        //     let data = [];
        //     for (let ua = 0; ua <= 300; ua += 5) {
        //         data.push([ua, this.ffFun(ua)]);
        //     }
        //     return data;
        // }

        fwFun(ua) { //风阻函数
            let fw = this.dtCoeAir * this.dtArea * Math.pow(ua, 2) / 21.15;
            return Math.round(fw);
        }

        // fwData() {//风阻数据
        //     let data = [];
        //     for (let ua = 0; ua <= 300; ua += 5) {
        //         data.push([ua, this.fwFun(ua)]);
        //     }
        //     return data;
        // }

        fffwFun(ua) { //风阻加滚阻函数
            let fffw = this.fwFun(ua) + this.ffFun(ua);
            return fffw;
        }

        fffwData() { //风阻加滚阻数据
            let data = [];
            for (let ua = 0; ua <= this.uaMaxFun(this.dtTransRats.length - 1) + 20; ua += 1) {
                data.push([ua, this.fffwFun(ua)]);
            }
            return data;
        }

        pfPwFun(ua) { //风阻加滚阻功率函数
            let pfPw = this.ffFun(ua) * ua / 3600 + this.fwFun(ua) * ua / 3600;
            return Math.round((pfPw / this.dtMechEffi) * 100) / 100;
        }

        pfPwData() { //风阻加滚阻功率数据
            let data = [];
            for (let ua = 0; ua <= this.uaMaxFun(this.dtTransRats.length - 1) + 20; ua += 1) {
                data.push([ua, this.pfPwFun(ua)]);
            }
            return data;
        }

        // 矩阵计算start
        // multiply(a, b) { //相乘      此函数运行出错，使用math.js 中的math.unltiply代替
        //     // 相乘约束
        //     if (a[0].length !== b.length) {
        //         throw new Error();
        //     }
        //     let m = a.length;
        //     let p = a[0].length;
        //     let n = b[0].length;

        //     // 初始化 m*n 全 0 二维数组
        //     let c = new Array(m).fill(0).map(arr => new Array(n).fill(0));

        //     for (let i = 0; i < m; i++) {
        //         for (let j = 0; j < n; j++) {
        //             for (let k = 0; k < p; k++) {
        //                 c[i][j] += a[i][k] * b[k][j];
        //             }
        //         }
        //     }

        //     return c;
        // }

        det(square) { //行列式计算
            // 方阵约束
            if (square.length !== square[0].length) {
                throw new Error();
            }
            // 方阵阶数
            let n = square.length;

            let result = 0;
            if (n > 3) {
                // n 阶
                for (let column = 0; column < n; column++) {
                    // 去掉第 0 行第 column 列的矩阵
                    let matrix = new Array(n - 1).fill(0).map(arr => new Array(n - 1).fill(0));
                    for (let i = 0; i < n - 1; i++) {
                        for (let j = 0; j < n - 1; j++) {
                            if (j < column) {
                                matrix[i][j] = square[i + 1][j];
                            } else {
                                matrix[i][j] = square[i + 1][j + 1];
                            }
                        }
                    }
                    result += square[0][column] * Math.pow(-1, 0 + column) * this.det(matrix);
                }
            } else if (n === 3) {
                // 3 阶
                result = square[0][0] * square[1][1] * square[2][2] +
                    square[0][1] * square[1][2] * square[2][0] +
                    square[0][2] * square[1][0] * square[2][1] -
                    square[0][2] * square[1][1] * square[2][0] -
                    square[0][1] * square[1][0] * square[2][2] -
                    square[0][0] * square[1][2] * square[2][1];
            } else if (n === 2) {
                // 2 阶
                result = square[0][0] * square[1][1] - square[0][1] * square[1][0];
            } else if (n === 1) {
                // 1 阶
                result = square[0][0];
            }
            return result;
        }

        transpose(matrix) { //转置矩阵计算
            let result = new Array(matrix.length).fill(0).map(arr => new Array(matrix[0].length).fill(0));
            for (let i = 0; i < result.length; i++) {
                for (let j = 0; j < result[0].length; j++) {
                    result[i][j] = matrix[j][i];
                }
            }
            return result;
        }

        adjoint(square) { //伴随矩阵
            // 方阵约束
            if (square[0].length !== square.length) {
                throw new Error();
            }

            let n = square.length;

            let result = new Array(n).fill(0).map(arr => new Array(n).fill(0));
            for (let row = 0; row < n; row++) {
                for (let column = 0; column < n; column++) {
                    // 去掉第 row 行第 column 列的矩阵
                    let matrix = [];
                    for (let i = 0; i < square.length; i++) {
                        if (i !== row) {
                            let arr = [];
                            for (let j = 0; j < square.length; j++) {
                                if (j !== column) {
                                    arr.push(square[i][j]);
                                }
                            }
                            matrix.push(arr);
                        }
                    }
                    result[row][column] = Math.pow(-1, row + column) * this.det(matrix);
                }
            }
            return this.transpose(result);
        }

        inv(square) { //逆矩阵
            if (square[0].length !== square.length) {
                throw new Error();
            }
            let detValue = this.det(square);
            let result = this.adjoint(square);

            for (let i = 0; i < result.length; i++) {
                for (let j = 0; j < result.length; j++) {
                    result[i][j] /= detValue;
                }
            }
            return result;
        }

        // 矩阵计算end

        checkRadio() {
            let radios = this.main.querySelectorAll(".radio");
            let value;
            for (let index in radios) {
                if (radios[index].checked) {
                    value = radios[index].value;
                    break;
                }
            }
            return value
        }


    }
    //电动车类
    class EVeh {
        constructor(id) {
            this.main = document.querySelector(id); //该类对应的div对象
            this.presele = this.main.querySelector('.presele'); //输入框中的车辆预选参数
            this.vehName = this.main.querySelector('.veh_name'); //输入框中的车辆名
            this.elecRightDiv = this.main.querySelector('.elec_right_div'); //获取echarts容器大小变化
            this.optPlots = this.main.querySelectorAll('.opt_plot'); //获取曲线选择中的option

            this.maxTtq = this.main.querySelector('.max_ttq'); //输入框中最大转矩
            this.maxPe = this.main.querySelector('.max_pe'); //输入框中最大功率
            this.transRats = this.main.querySelectorAll('.tran_rat'); //输入框中的各前进挡传动比
            this.mainRat = this.main.querySelector('.main_rat'); //输入框中主减速比
            this.engineSpeeds = this.main.querySelectorAll('.engine_speed'); //输入框中的发动机额定转速和最高转速
            this.mechEffi = this.main.querySelector('.mech_effi'); //输入框中的传动效率
            this.radius = this.main.querySelector('.radius'); //输入框中的车轮滚动半径
            this.coeAir = this.main.querySelector('.coe_air'); //输入框中的空气阻力系数
            this.area = this.main.querySelector('.area'); //输入框中的迎风面积
            this.quality = this.main.querySelector('.quality'); //输入框中的整车质量
            this.selePlot = this.main.querySelector('.sele_plot'); //输出框中的曲线选择

            this.inputN = this.main.querySelectorAll('.input_n'); //输入框中的转速
            this.inputB0 = this.main.querySelectorAll('.input_B0'); //输入框中的燃油消耗率系数
            this.inputB1 = this.main.querySelectorAll('.input_B1'); //输入框中的燃油消耗率系数
            this.inputB2 = this.main.querySelectorAll('.input_B2'); //输入框中的燃油消耗率系数
            this.inputB3 = this.main.querySelectorAll('.input_B3'); //输入框中的燃油消耗率系数
            this.inputB4 = this.main.querySelectorAll('.input_B4'); //输入框中的燃油消耗率系数

            // 绑定echart
            this.myChart = echarts.init(this.main.querySelector('.elec_chart'));

            //获取点击元素
            this.delBnt = this.main.querySelector('.del');
            this.resBnt = this.main.querySelector('.res');
            // this.testBnt = this.main.querySelector('.test');//用于开发测试


            //绑定事件
            this.delBnt.addEventListener('click', this.del);
            this.resBnt.addEventListener('click', this.getData.bind(this));
            this.resBnt.addEventListener('click', this.changePlot.bind(this.selePlot, this));
            this.selePlot.addEventListener('change', this.changePlot.bind(this.selePlot, this));
            // this.testBnt.addEventListener('click', this.testFun.bind(this));//用于测试开发

            this.presele.addEventListener('change', this.seleData.bind(this));
            // this.vehName.addEventListener('change', this.seleData.bind(this));

            //初始化数据
            this.init();

            //初始化曲线
            this.vainPlot = { //计算结果输出前展示的原始图
                title: {
                    text: '',
                    left: 'center',
                },
                toolbox: { //工具箱，如另存图片
                    right: 20,
                },
                radar: {
                    shape: 'circle',
                    splitNumber: '5',
                    backgroundColor: 'rgba(150, 100, 250, 0.4)',
                    center: ['50%', '45%'],
                    radius: ["10%", "50%"],
                    indicator: [{},
                        {},
                        {},
                        {},
                        {},
                        {},
                    ],
                    axisName: {
                        color: '#666',
                    },
                    splitArea: {
                        areaStyle: {
                            shadowColor: 'rgba(0, 0, 0, 0.2)',
                            shadowBlur: 10
                        }
                    },
                },
                series: [{
                    name: '',
                    type: 'radar',
                    data: [{
                        name: '',
                        symbol: 'circle',
                        symbolSize: 12,
                        lineStyle: {},
                        areaStyle: {
                            color: new echarts.graphic.RadialGradient(0.1, 0.6, 1, [{
                                    color: 'rgba(0, 145, 225, 0.01)',
                                    offset: 0
                                },
                                {
                                    color: 'rgba(0, 145, 225, 0.9)',
                                    offset: 1
                                }
                            ])
                        },
                        label: {
                            show: true,
                            formatter: function (params) {
                                return params.value;
                            }
                        }
                    }, ]
                }, ]
            };

            // 发动机外特性曲线配置项
            this.enginePlot = {
                title: { //题目
                    text: `${this.vehName.value} 发动机 外特性动力曲线`,
                    // link: 'https://echarts.apache.org/zh/option.html#title.link',
                    left: 'center',
                },
                tooltip: { //鼠标悬浮提示信息
                    trigger: 'axis', //折线图的线上
                    backgroundColor: 'rgba(250,250,250,0.3)'
                    // axisPointer: {//十字线
                    //     type: 'cross'
                    // },
                },
                legend: { //图例组件
                    top: 30
                    // data: ['扭力', '加速度', '燃油经济性', '驱动力'] //当series中的name存在时，本行可省略
                },
                animation: true, //图例翻页动画
                grid: { //网格配置，控制图表显示部分大小
                    show: true,
                    top: 60,
                    left: 30,
                    right: 20,
                    bottom: 15,
                    containLabel: true, //显示坐标轴上的数据
                    backgroundColor: 'rgba(250, 250, 250, 0.4)'
                },
                toolbox: { //工具箱，如另存图片
                    right: 20,
                    feature: {
                        saveAsImage: {}, //保存图片
                        restore: {}, //重置
                        dataView: {}, //数据框
                    }
                },
                xAxis: {
                    // type: 'category', //category类目 value值
                    name: '转速/(r/min)',
                    boundaryGap: true, //图表显示部分和坐标轴是否有缝隙
                    min: 0,
                    max: function (value) {
                        return Math.round(value.max) + 1000;
                    },
                    minorTick: { //是否显示刻度线
                        show: true
                    },
                    minorSplitLine: { //是否显示分割线
                        show: true
                    },
                    nameLocation: 'middle',
                    nameGap: 20, //轴名字移动
                    // nameRotate: -90 //轴名字旋转
                },
                yAxis: [{
                    name: '功率/(KW)',
                    min: 0, //设置坐标轴范围
                    max: function (value) {
                        return Math.round(value.max) + 50;
                    },
                    minorTick: {
                        show: true
                    },
                    minorSplitLine: {
                        show: true
                    },
                    axisLabel: {
                        // formatter: '{value} KW' //坐标轴上的数据单位
                    }
                }, {
                    name: '转矩/(N.m)',
                    min: function (value) {
                        return Math.round(value.min) - 50;
                    },
                    max: function (value) {
                        return Math.round(value.max) + 50;
                    },
                    minorTick: {
                        show: true
                    },
                    minorSplitLine: {
                        show: true
                    },
                    axisLabel: {
                        // formatter: '{value} N.m' //坐标轴上的数据单位
                    }
                }],
                dataZoom: [{ //是否允许图表放大缩小
                    show: true,
                    type: 'inside', //slider表示外置拖动条
                    filterMode: 'none', //数据过滤
                    xAxisIndex: [0],
                    start: 0,
                    end: 100
                }, {
                    show: true,
                    type: 'inside',
                    filterMode: 'none',
                    yAxisIndex: [0, 1], //缩放时影响第一和第二个y轴
                    start: 0,
                    end: 100
                }],
                series: [ //系列图表配置，决定显示的图标类型 
                    {
                        type: 'line',
                        name: '功率/(KW)',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // data: this.peData(),
                    }, {
                        type: 'line', //图的种类是线
                        name: '转矩/(N.m)',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        yAxisIndex: 1, //选择该曲线的坐标轴
                        // smooth: true, //曲线平滑
                    }
                    // color: ['red', 'yellow']可用于修改颜色
                ]
            };

            //车辆 驱动力——行驶阻力曲线
            this.fPlot = {
                title: { //题目
                    text: '车辆 驱动力——行驶阻力曲线',
                    left: 'center',

                },
                tooltip: { //鼠标悬浮提示信息
                    trigger: 'axis', //折线图的线上
                    backgroundColor: 'rgba(250,250,250,0.1)'

                    // axisPointer: {//十字线
                    //     type: 'cross'
                    // },
                },
                legend: { //图例组件
                    top: 30
                    // data: ['扭力', '加速度', '燃油经济性', '驱动力'] //当series中的name存在时，本行可省略
                },
                animation: true, //图例翻页动画
                grid: { //网格配置，控制图表显示部分大小
                    show: true,
                    top: 60,
                    left: 30,
                    right: 20,
                    bottom: 15,
                    containLabel: true, //显示坐标轴上的数据
                    backgroundColor: 'rgba(40, 250, 250, 0.2)'
                },
                toolbox: { //工具箱，如另存图片
                    right: 20,
                    feature: {
                        saveAsImage: {}, //保存图片
                        restore: {}, //重置
                        dataView: {}, //数据框

                    }
                },
                xAxis: {
                    // type: 'category', //category类目 value值

                    name: '车速/(km/h)',
                    boundaryGap: true, //图表显示部分和坐标轴是否有缝隙
                    min: 0,
                    max: function (value) {
                        return value.max + 10;
                    },
                    minorTick: { //是否显示刻度线
                        show: true
                    },
                    minorSplitLine: { //是否显示分割线
                        show: true
                    },
                    nameLocation: 'middle',
                    nameGap: 20, //轴名字移动
                    // nameRotate: -90 //轴名字旋转
                },
                yAxis: {
                    name: '力/(N)',
                    min: 0, //设置坐标轴范围
                    max: function (value) {
                        return value.max + 1000;
                    },
                    minorTick: {
                        show: true
                    },
                    minorSplitLine: {
                        show: true
                    },
                    axisLabel: {
                        // formatter: '{value} KW' //坐标轴上的数据单位
                    }
                },


                dataZoom: [{ //是否允许图表放大缩小
                    show: true,
                    type: 'inside', //slider表示外置拖动条
                    filterMode: 'none', //数据过滤
                    xAxisIndex: [0],
                    start: 0,
                    end: 100
                }, {
                    show: true,
                    type: 'inside',
                    filterMode: 'none',
                    yAxisIndex: [0], //缩放时影响第一和第二个y轴
                    start: 0,
                    end: 100
                }],
                series: [ //系列图表配置，决定显示的图标类型 
                    {
                        type: 'line',
                        name: 'Fw+Ff',
                        color: 'rgb(150,150,150)',
                        areaStyle: {
                            opacity: 0.4
                        },
                        showSymbol: false,
                        clip: true,
                        // data: this.ffData(),
                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }
                    // color: ['red', 'yellow']可用于修改颜色

                ]
            };

            //车辆 功率平衡曲线
            this.pPlot = {
                title: { //题目
                    text: '车辆 功率平衡曲线',
                    left: 'center',

                },
                tooltip: { //鼠标悬浮提示信息
                    trigger: 'axis', //折线图的线上
                    backgroundColor: 'rgba(250,250,250,0.3)'

                    // axisPointer: {//十字线
                    //     type: 'cross'
                    // },
                },
                legend: { //图例组件
                    top: 30
                    // data: ['扭力', '加速度', '燃油经济性', '驱动力'] //当series中的name存在时，本行可省略
                },
                animation: true, //图例翻页动画
                grid: { //网格配置，控制图表显示部分大小
                    show: true,
                    top: 60,
                    left: 30,
                    right: 20,
                    bottom: 15,
                    containLabel: true, //显示坐标轴上的数据
                    backgroundColor: 'rgba(250, 0, 250, 0.1)'
                },
                toolbox: { //工具箱，如另存图片
                    right: 20,
                    feature: {
                        saveAsImage: {}, //保存图片
                        restore: {}, //重置
                        dataView: {}, //数据框

                    }
                },
                xAxis: {
                    // type: 'category', //category类目 value值

                    name: '车速/(km/h)',
                    boundaryGap: true, //图表显示部分和坐标轴是否有缝隙
                    min: 0,
                    max: function (value) {
                        return value.max + 10;
                    },
                    minorTick: { //是否显示刻度线
                        show: true
                    },
                    minorSplitLine: { //是否显示分割线
                        show: true
                    },
                    nameLocation: 'middle',
                    nameGap: 20, //轴名字移动
                    // nameRotate: -90 //轴名字旋转
                },
                yAxis: {
                    name: '功率/(KW)',
                    min: 0, //设置坐标轴范围
                    max: function (value) {
                        return Math.round(value.max) + 5;
                    },
                    minorTick: {
                        show: true
                    },
                    minorSplitLine: {
                        show: true
                    },
                    axisLabel: {
                        // formatter: '{value} KW' //坐标轴上的数据单位
                    }
                },


                dataZoom: [{ //是否允许图表放大缩小
                    show: true,
                    type: 'inside', //slider表示外置拖动条
                    filterMode: 'none', //数据过滤
                    xAxisIndex: [0],
                    start: 0,
                    end: 100
                }, {
                    show: true,
                    type: 'inside',
                    filterMode: 'none',
                    yAxisIndex: [0], //缩放时影响第一和第二个y轴
                    start: 0,
                    end: 100
                }],
                series: [ //系列图表配置，决定显示的图标类型 
                    {
                        type: 'line',
                        name: '(Pw+Pf)/nT',
                        color: 'rgb(150,150,150)',
                        areaStyle: {
                            opacity: 0.4
                        },
                        showSymbol: false,
                        clip: true,
                        // data: this.ffData(),
                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        }
                    }
                    // color: ['red', 'yellow']可用于修改颜色

                ]
            };

            //后备功率曲线
            this.ppPlot = {
                title: { //题目
                    text: '后备功率曲线',
                    left: 'center',

                },
                tooltip: { //鼠标悬浮提示信息
                    trigger: 'axis', //折线图的线上
                    backgroundColor: 'rgba(250,250,250,0.3)'

                    // axisPointer: {//十字线
                    //     type: 'cross'
                    // },
                },
                legend: { //图例组件
                    top: 30
                    // data: ['扭力', '加速度', '燃油经济性', '驱动力'] //当series中的name存在时，本行可省略
                },
                animation: true, //图例翻页动画
                grid: { //网格配置，控制图表显示部分大小
                    show: true,
                    top: 60,
                    left: 30,
                    right: 20,
                    bottom: 15,
                    containLabel: true, //显示坐标轴上的数据
                    backgroundColor: 'rgba(250, 0, 250, 0.1)'
                },
                toolbox: { //工具箱，如另存图片
                    right: 20,
                    feature: {
                        saveAsImage: {}, //保存图片
                        restore: {}, //重置
                        dataView: {}, //数据框

                    }
                },
                xAxis: {
                    // type: 'category', //category类目 value值

                    name: '车速/(km/h)',
                    boundaryGap: true, //图表显示部分和坐标轴是否有缝隙
                    min: 0,
                    max: function (value) {
                        return value.max + 10;
                    },
                    minorTick: { //是否显示刻度线
                        show: true
                    },
                    minorSplitLine: { //是否显示分割线
                        show: true
                    },
                    nameLocation: 'middle',
                    nameGap: 20, //轴名字移动
                    // nameRotate: -90 //轴名字旋转
                },
                yAxis: {
                    name: '功率/(KW)',
                    min: 0, //设置坐标轴范围
                    max: function (value) {
                        return Math.round(value.max) + 10;
                    },
                    minorTick: {
                        show: true
                    },
                    minorSplitLine: {
                        show: true
                    },
                    axisLabel: {
                        // formatter: '{value} KW' //坐标轴上的数据单位
                    }
                },


                dataZoom: [{ //是否允许图表放大缩小
                    show: true,
                    type: 'inside', //slider表示外置拖动条
                    filterMode: 'none', //数据过滤
                    xAxisIndex: [0],
                    start: 0,
                    end: 100
                }, {
                    show: true,
                    type: 'inside',
                    filterMode: 'none',
                    yAxisIndex: [0], //缩放时影响第一和第二个y轴
                    start: 0,
                    end: 100
                }],
                series: [ //系列图表配置，决定显示的图标类型 
                    {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }
                    // color: ['red', 'yellow']可用于修改颜色

                ]
            };

            //加速度曲线
            this.aPlot = {
                title: { //题目
                    text: '车辆 加速度曲线',
                    left: 'center',

                },
                tooltip: { //鼠标悬浮提示信息
                    trigger: 'axis', //折线图的线上
                    backgroundColor: 'rgba(250,250,250,0.3)'

                    // axisPointer: {//十字线
                    //     type: 'cross'
                    // },
                },
                legend: { //图例组件
                    top: 30
                    // data: ['扭力', '加速度', '燃油经济性', '驱动力'] //当series中的name存在时，本行可省略
                },
                animation: true, //图例翻页动画
                grid: { //网格配置，控制图表显示部分大小
                    show: true,
                    top: 60,
                    left: 30,
                    right: 20,
                    bottom: 15,
                    containLabel: true, //显示坐标轴上的数据
                    backgroundColor: 'rgba(250, 250, 0, 0.1)'
                },
                toolbox: { //工具箱，如另存图片
                    right: 20,
                    feature: {
                        saveAsImage: {}, //保存图片
                        restore: {}, //重置
                        dataView: {}, //数据框

                    }
                },
                xAxis: {
                    // type: 'category', //category类目 value值

                    name: '车速/(km/h)',
                    boundaryGap: true, //图表显示部分和坐标轴是否有缝隙
                    min: 0,
                    max: function (value) {
                        return value.max + 10;
                    },
                    minorTick: { //是否显示刻度线
                        show: true
                    },
                    minorSplitLine: { //是否显示分割线
                        show: true
                    },
                    nameLocation: 'middle',
                    nameGap: 20, //轴名字移动
                    // nameRotate: -90 //轴名字旋转
                },
                yAxis: {
                    name: '加速度(m/s²)',
                    min: 0, //设置坐标轴范围
                    max: function (value) {
                        return Math.round(value.max) + 1;
                    },
                    minorTick: {
                        show: true
                    },
                    minorSplitLine: {
                        show: true
                    },
                    axisLabel: {
                        // formatter: '{value} KW' //坐标轴上的数据单位
                    }
                },


                dataZoom: [{ //是否允许图表放大缩小
                    show: true,
                    type: 'inside', //slider表示外置拖动条
                    filterMode: 'none', //数据过滤
                    xAxisIndex: [0],
                    start: 0,
                    end: 100
                }, {
                    show: true,
                    type: 'inside',
                    filterMode: 'none',
                    yAxisIndex: [0], //缩放时影响第一和第二个y轴
                    start: 0,
                    end: 100
                }],
                series: [ //系列图表配置，决定显示的图标类型 
                    {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }

                ]
            };
            //加速度倒数曲线
            this.aaPlot = {
                title: { //题目
                    text: '车辆 加速度倒数曲线',
                    left: 'center',

                },
                tooltip: { //鼠标悬浮提示信息
                    trigger: 'axis', //折线图的线上
                    backgroundColor: 'rgba(250,250,250,0.3)'

                    // axisPointer: {//十字线
                    //     type: 'cross'
                    // },
                },
                legend: { //图例组件
                    top: 30
                    // data: ['扭力', '加速度', '燃油经济性', '驱动力'] //当series中的name存在时，本行可省略
                },
                animation: true, //图例翻页动画
                grid: { //网格配置，控制图表显示部分大小
                    show: true,
                    top: 60,
                    left: 30,
                    right: 20,
                    bottom: 15,
                    containLabel: true, //显示坐标轴上的数据
                    backgroundColor: 'rgba(250, 250, 0, 0.1)'
                },
                toolbox: { //工具箱，如另存图片
                    right: 20,
                    feature: {
                        saveAsImage: {}, //保存图片
                        restore: {}, //重置
                        dataView: {}, //数据框

                    }
                },
                xAxis: {
                    // type: 'category', //category类目 value值

                    name: '车速/(km/h)',
                    boundaryGap: true, //图表显示部分和坐标轴是否有缝隙
                    min: 0,
                    max: function (value) {
                        return value.max + 10;
                    },
                    minorTick: { //是否显示刻度线
                        show: true
                    },
                    minorSplitLine: { //是否显示分割线
                        show: true
                    },
                    nameLocation: 'middle',
                    nameGap: 20, //轴名字移动
                    // nameRotate: -90 //轴名字旋转
                },
                yAxis: {
                    name: '加速度倒数/(s²/m)',
                    min: 0, //设置坐标轴范围
                    max: function (value) {
                        return Math.round(value.max + 0.5);
                    },
                    minorTick: {
                        show: true
                    },
                    minorSplitLine: {
                        show: true
                    },
                    axisLabel: {
                        // formatter: '{value} KW' //坐标轴上的数据单位
                    }
                },


                dataZoom: [{ //是否允许图表放大缩小
                    show: true,
                    type: 'inside', //slider表示外置拖动条
                    filterMode: 'none', //数据过滤
                    xAxisIndex: [0],
                    start: 0,
                    end: 100
                }, {
                    show: true,
                    type: 'inside',
                    filterMode: 'none',
                    yAxisIndex: [0], //缩放时影响第一和第二个y轴
                    start: 0,
                    end: 100
                }],
                series: [ //系列图表配置，决定显示的图标类型 
                    {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'min',
                                name: 'Min'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'min',
                                name: 'Min'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'min',
                                name: 'Min'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'min',
                                name: 'Min'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'min',
                                name: 'Min'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'min',
                                name: 'Min'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'min',
                                name: 'Min'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'min',
                                name: 'Min'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }

                ]
            };
            //加速时间
            this.tPlot = {
                title: { //题目
                    text: `${this.vehName.value} 车辆 加速时间`,
                    left: 'center',
                },
                tooltip: { //鼠标悬浮提示信息
                    trigger: 'axis', //折线图的线上
                    backgroundColor: 'rgba(250,250,250,0.3)'
                },
                legend: { //图例组件
                    top: 30
                },
                animation: true, //图例翻页动画
                grid: { //网格配置，控制图表显示部分大小
                    show: true,
                    top: 60,
                    left: 30,
                    right: 20,
                    bottom: 15,
                    containLabel: true, //显示坐标轴上的数据
                    backgroundColor: 'rgba(120, 140, 200, 0.2)'
                },
                toolbox: { //工具箱，如另存图片
                    right: 20,
                    feature: {
                        saveAsImage: {}, //保存图片
                        restore: {}, //重置
                        dataView: {}, //数据框
                    }
                },
                xAxis: {
                    name: '车速/(km/h)',
                    boundaryGap: true, //图表显示部分和坐标轴是否有缝隙
                    min: 0,
                    max: function (value) {
                        return Math.round(value.max) + 20;
                    },
                    minorTick: { //是否显示刻度线
                        show: true
                    },
                    minorSplitLine: { //是否显示分割线
                        show: true
                    },
                    nameLocation: 'middle',
                    nameGap: 20, //轴名字移动
                },
                yAxis: [{
                    name: '时间(s)',
                    min: 0, //设置坐标轴范围
                    max: function (value) {
                        return Math.round(value.max) + 20;
                    },
                    minorTick: {
                        show: true
                    },
                    minorSplitLine: {
                        show: true
                    },
                    axisLabel: {
                        // formatter: '{value} KW' //坐标轴上的数据单位
                    }
                }],
                dataZoom: [{ //是否允许图表放大缩小
                    show: true,
                    type: 'inside', //slider表示外置拖动条
                    filterMode: 'none', //数据过滤
                    xAxisIndex: [0],
                    start: 0,
                    end: 100
                }, {
                    show: true,
                    type: 'inside',
                    filterMode: 'none',
                    yAxisIndex: [0, 1], //缩放时影响第一和第二个y轴
                    start: 0,
                    end: 100
                }],
                series: [ //系列图表配置，决定显示的图标类型 
                    {
                        type: 'line',
                        name: '时间(s)',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },

                        },
                    }
                ]
            };

            //爬坡度曲线
            this.iPlot = {
                title: { //题目
                    text: '车辆 爬坡度曲线',
                    left: 'center',

                },
                tooltip: { //鼠标悬浮提示信息
                    trigger: 'axis', //折线图的线上
                    backgroundColor: 'rgba(250,250,250,0.3)'

                    // axisPointer: {//十字线
                    //     type: 'cross'
                    // },
                },
                legend: { //图例组件
                    top: 30
                    // data: ['扭力', '加速度', '燃油经济性', '驱动力'] //当series中的name存在时，本行可省略
                },
                animation: true, //图例翻页动画
                grid: { //网格配置，控制图表显示部分大小
                    show: true,
                    top: 60,
                    left: 30,
                    right: 20,
                    bottom: 15,
                    containLabel: true, //显示坐标轴上的数据
                    backgroundColor: 'rgba(150, 200, 250, 0.1)'
                },
                toolbox: { //工具箱，如另存图片
                    right: 20,
                    feature: {
                        saveAsImage: {}, //保存图片
                        restore: {}, //重置
                        dataView: {}, //数据框

                    }
                },
                xAxis: {
                    // type: 'category', //category类目 value值

                    name: '车速/(km/h)',
                    boundaryGap: true, //图表显示部分和坐标轴是否有缝隙
                    min: 0,
                    max: function (value) {
                        return value.max + 20;
                    },
                    minorTick: { //是否显示刻度线
                        show: true
                    },
                    minorSplitLine: { //是否显示分割线
                        show: true
                    },
                    nameLocation: 'middle',
                    nameGap: 20, //轴名字移动
                    // nameRotate: -90 //轴名字旋转
                },
                yAxis: {
                    name: '爬坡度/(%)',
                    min: 0, //设置坐标轴范围
                    max: function (value) {
                        return Math.round(value.max + 5);
                    },
                    minorTick: {
                        show: true
                    },
                    minorSplitLine: {
                        show: true
                    },
                    axisLabel: {
                        // formatter: '{value} KW' //坐标轴上的数据单位
                    }
                },


                dataZoom: [{ //是否允许图表放大缩小
                    show: true,
                    type: 'inside', //slider表示外置拖动条
                    filterMode: 'none', //数据过滤
                    xAxisIndex: [0],
                    start: 0,
                    end: 100
                }, {
                    show: true,
                    type: 'inside',
                    filterMode: 'none',
                    yAxisIndex: [0], //缩放时影响第一和第二个y轴
                    start: 0,
                    end: 100
                }],
                series: [ //系列图表配置，决定显示的图标类型 
                    {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        smooth: true,

                        // data: this.ffData(),
                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),

                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),
                    }, {
                        type: 'line', //图的种类是线
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },
                            data: [{
                                type: 'max',
                                name: 'Max'
                            }, ]
                        },
                        // smooth: true, //曲线平滑
                        // data: this.fwData(),
                    }
                    // color: ['red', 'yellow']可用于修改颜色

                ]
            };

            //负荷特性曲线
            this.bPlot = {
                title: { //题目
                    text: '电机效率曲线',
                    left: 'center',
                },
                tooltip: { //鼠标悬浮提示信息
                    trigger: 'axis', //折线图的线上
                    backgroundColor: 'rgba(250 ,250 ,250 ,0.3)'
                },
                legend: { //图例组件
                    top: 40
                },
                animation: true, //图例翻页动画
                grid: { //网格配置，控制图表显示部分大小
                    show: true,
                    top: 60,
                    left: 30,
                    right: 20,
                    bottom: 15,
                    containLabel: true, //显示坐标轴上的数据
                    backgroundColor: 'rgba(250, 250, 250, 0.4)'
                },
                toolbox: { //工具箱，如另存图片
                    right: 20,
                    feature: {
                        saveAsImage: {}, //保存图片
                        restore: {}, //重置
                        dataView: {}, //数据框
                    }
                },
                xAxis: {
                    name: '电机转矩(N.m)',
                    boundaryGap: true, //图表显示部分和坐标轴是否有缝隙
                    min: 0,
                    max: function (value) {
                        return Math.round(value.max) + 5;
                    },
                    minorTick: { //是否显示刻度线
                        show: true
                    },
                    minorSplitLine: { //是否显示分割线
                        show: true
                    },
                    nameLocation: 'middle',
                    nameGap: 20, //轴名字移动
                    // nameRotate: -90 //轴名字旋转
                },
                yAxis: {
                    name: '电机效率(/%)',
                    min: function (value) {
                        return Math.round(value.min) - 10;
                    }, //设置坐标轴范围
                    max: 100,
                    minorTick: {
                        show: true
                    },
                    minorSplitLine: {
                        show: true
                    },
                    axisLabel: {
                        // formatter: '{value} KW' //坐标轴上的数据单位
                    }
                },


                dataZoom: [{ //是否允许图表放大缩小
                    show: true,
                    type: 'inside', //slider表示外置拖动条
                    filterMode: 'none', //数据过滤
                    xAxisIndex: [0],
                    start: 0,
                    end: 100
                }, {
                    show: true,
                    type: 'inside',
                    filterMode: 'none',
                    yAxisIndex: [0], //缩放时影响第一和第二个y轴
                    start: 0,
                    end: 100
                }],
                series: [ //系列图表配置，决定显示的图标类型 
                    {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },

                        },
                        // data: this.ffData(),
                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },

                        },
                        // data: this.ffData(),
                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },

                        },
                        // data: this.ffData(),
                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },

                        },
                        // data: this.ffData(),
                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },

                        },
                        // data: this.ffData(),
                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },

                        },
                        // data: this.ffData(),
                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },

                        },
                        // data: this.ffData(),
                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 5,
                            label: {
                                fontSize: 8,
                                position: [0, -10]
                            },

                        },
                        // data: this.ffData(),
                    }
                    // smooth: true, //曲线平滑
                    // data: this.fwData(),



                    // color: ['red', 'yellow']可用于修改颜色

                ]
            };

            //能量消耗率
            this.qsPlot = {
                title: { //题目
                    text: `${this.vehName.value} 百公里燃油消耗量`,
                    // link: 'https://echarts.apache.org/zh/option.html#title.link',
                    left: 'center',
                },
                tooltip: { //鼠标悬浮提示信息
                    trigger: 'axis', //折线图的线上
                    backgroundColor: 'rgba(250,250,250,0.3)'

                    // axisPointer: {//十字线
                    //     type: 'cross'
                    // },
                },
                legend: { //图例组件
                    top: 30
                    // data: ['扭力', '加速度', '燃油经济性', '驱动力'] //当series中的name存在时，本行可省略
                },
                animation: true, //图例翻页动画
                grid: { //网格配置，控制图表显示部分大小
                    show: true,
                    top: 60,
                    left: 30,
                    right: 20,
                    bottom: 15,
                    containLabel: true, //显示坐标轴上的数据
                    backgroundColor: 'rgba(250, 50, 50, 0.1)'
                },
                toolbox: { //工具箱，如另存图片
                    right: 20,
                    feature: {
                        saveAsImage: {}, //保存图片
                        restore: {}, //重置
                        dataView: {}, //数据框

                    }
                },


                xAxis: {
                    // type: 'category', //category类目 value值

                    name: '车速(km/h)',
                    boundaryGap: true, //图表显示部分和坐标轴是否有缝隙
                    min: 0,
                    max: function (value) {
                        return Math.round(value.max + 20);
                    },
                    minorTick: { //是否显示刻度线
                        show: true
                    },
                    minorSplitLine: { //是否显示分割线
                        show: true
                    },
                    nameLocation: 'middle',
                    nameGap: 20, //轴名字移动
                    // nameRotate: -90 //轴名字旋转
                },
                yAxis: [{
                    name: '能耗(W.h/km)',
                    min: 0, //设置坐标轴范围
                    max: function (value) {
                        return Math.round(value.max + 3);
                    },
                    minorTick: {
                        show: true
                    },
                    minorSplitLine: {
                        show: true
                    },
                    axisLabel: {
                        // formatter: '{value} KW' //坐标轴上的数据单位
                    }
                }],

                dataZoom: [{ //是否允许图表放大缩小
                    show: true,
                    type: 'inside', //slider表示外置拖动条
                    filterMode: 'none', //数据过滤
                    xAxisIndex: [0],
                    start: 0,
                    end: 100
                }, {
                    show: true,
                    type: 'inside',
                    filterMode: 'none',
                    yAxisIndex: [0, 1], //缩放时影响第一和第二个y轴
                    start: 0,
                    end: 100
                }],
                series: [ //系列图表配置，决定显示的图标类型 
                    {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        smooth: true, //曲线平滑
                        // markPoint: {
                        //     symbol: 'circle',
                        //     symbolSize: 5,
                        //     label: {
                        //         fontSize: 8,
                        //         position: [0, -10]
                        //     },
                        //     data: [
                        //         { type: 'max', name: 'Max' },
                        //     ]
                        // },


                        // data: this.peData(),

                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        smooth: true, //曲线平滑

                        // data: this.peData(),

                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        smooth: true, //曲线平滑

                        // data: this.peData(),

                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        smooth: true, //曲线平滑

                        // data: this.peData(),

                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        smooth: true, //曲线平滑

                        // data: this.peData(),

                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        smooth: true, //曲线平滑

                        // data: this.peData(),

                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        smooth: true, //曲线平滑

                        // data: this.peData(),

                    }, {
                        type: 'line',
                        name: '',
                        showSymbol: false,
                        clip: true,
                        smooth: true, //曲线平滑

                        // data: this.peData(),

                    }
                    // color: ['red', 'yellow']可用于修改颜色

                ]
            };

            //综合性能雷达图
            this.radar = {

                title: {
                    text: '',
                    left: 'center',
                },

                toolbox: { //工具箱，如另存图片
                    right: 20,
                    feature: {
                        saveAsImage: {}, //保存图片


                    }
                },
                // tooltip: { //鼠标悬浮提示信息
                //     trigger: 'item',
                //     backgroundColor: 'rgba(250,250,250,0.3)'

                // },

                radar: {
                    shape: 'circle',
                    splitNumber: '5',
                    backgroundColor: 'rgba(150, 100, 250, 0.7)',
                    center: ['50%', '45%'],
                    radius: ["10%", "50%"],
                    indicator: [{
                            name: '最大车速',
                            max: 360
                        },
                        {
                            name: '最大爬坡度',
                            max: 150
                        },
                        {
                            name: '最大扭矩',
                            max: 1000
                        },
                        {
                            name: '最大功率',
                            max: 514
                        },
                        {
                            name: '0——100加速时间',
                            max: 0,
                            min: 70,
                            inverse: true
                        },
                        {
                            name: '百公里燃油消耗量',
                            max: 0,
                            min: 400,
                            inverse: true
                        },
                    ],


                    axisName: {
                        color: '#666',
                        // backgroundColor: '#aaa',
                        // borderRadius: 3,
                        // padding: [5, 7]
                    },
                    splitArea: {
                        areaStyle: {
                            // color: ['#77EADF', '#26C3BE', '#64AFE9', '#428BD4'],
                            shadowColor: 'rgba(0, 0, 0, 0.2)',
                            shadowBlur: 10
                        }
                    },


                },

                series: [{
                        name: '性能',
                        type: 'radar',
                        data: [{
                                // value: [200, 0.3, 300, 100, 1 / 5.2, 1 / 7],
                                name: '',
                                symbol: 'circle',
                                symbolSize: 12,
                                lineStyle: {
                                    // type: 'dashed'
                                },
                                areaStyle: {
                                    color: new echarts.graphic.RadialGradient(0.4, 0.6, 0.5, [{
                                            color: 'rgba(0, 225, 145, 0.1)',
                                            offset: 0
                                        },
                                        {
                                            color: 'rgba(0, 225, 145, 0.9)',
                                            offset: 1
                                        }
                                    ])
                                },

                                label: {
                                    show: true,
                                    formatter: function (params) {
                                        return params.value;
                                    }
                                }
                            },

                        ]
                    },

                ]

            };



            this.myChart.setOption(this.vainPlot, true);


        }


        init() {
            //初始化数据
            this.dtMaxTtq;
            this.dtMaxPe;
            this.dtTransRats = [1];
            this.dtMainRat; //主减速比
            this.dtEngineSpeeds = []; //发动机额定转速和最高转速
            this.dtMechEffi; //传动机械效率
            this.dtRadius; //车轮滚动半径
            this.dtCoeAir; //空阻系数
            this.dtArea; //迎风面积
            this.dtQuality; //整车质量
            this.dtG = 9.8; //g值

            this.dtNBs = []; //初始化数组用于存储转速和燃油消耗率拟合系数



            window.addEventListener('resize', this.resizedom.bind(this)); //浏览器窗口大小监听

            this.selePlot.disabled = true; //禁用选择曲线框

        }
        del() { //删除键函数
            this.parentNode.parentNode.parentNode.remove();
        }
        resizedom() { //重置echarts，dom容器大小
            this.myChart.resize({
                width: this.elecRightDiv.offsetWidth,
            });
        }
        seleData() { //输入框预选车辆参数
            if (this.presele.value == 0) {
                this.vehName.value = '';

                this.maxTtq.value = '';
                this.maxPe.value = '';

                this.inputN[0].value = '';
                this.inputN[1].value = '';
                this.inputN[2].value = '';
                this.inputN[3].value = '';
                this.inputN[4].value = '';
                this.inputN[5].value = '';
                this.inputN[6].value = '';
                this.inputN[7].value = '';

                this.inputB0[0].value = '';
                this.inputB0[1].value = '';
                this.inputB0[2].value = '';
                this.inputB0[3].value = '';
                this.inputB0[4].value = '';
                this.inputB0[5].value = '';
                this.inputB0[6].value = '';
                this.inputB0[7].value = '';

                this.inputB1[0].value = '';
                this.inputB1[1].value = '';
                this.inputB1[2].value = '';
                this.inputB1[3].value = '';
                this.inputB1[4].value = '';
                this.inputB1[5].value = '';
                this.inputB1[6].value = '';
                this.inputB1[7].value = '';

                this.inputB2[0].value = '';
                this.inputB2[1].value = '';
                this.inputB2[2].value = '';
                this.inputB2[3].value = '';
                this.inputB2[4].value = '';
                this.inputB2[5].value = '';
                this.inputB2[6].value = '';
                this.inputB2[7].value = '';

                this.inputB3[0].value = '';
                this.inputB3[1].value = '';
                this.inputB3[2].value = '';
                this.inputB3[3].value = '';
                this.inputB3[4].value = '';
                this.inputB3[5].value = '';
                this.inputB3[6].value = '';
                this.inputB3[7].value = '';

                this.inputB4[0].value = '';
                this.inputB4[1].value = '';
                this.inputB4[2].value = '';
                this.inputB4[3].value = '';
                this.inputB4[4].value = '';
                this.inputB4[5].value = '';
                this.inputB4[6].value = '';
                this.inputB4[7].value = '';

                this.transRats[0].value = '';
                this.transRats[1].value = '';
                this.transRats[2].value = '';
                this.transRats[3].value = '';
                this.transRats[4].value = '';

                this.mainRat.value = '';

                this.engineSpeeds[0].value = '';
                this.engineSpeeds[1].value = '';

                this.mechEffi.value = '';

                this.radius.value = '';

                this.coeAir.value = '';

                this.area.value = '';

                this.quality.value = '';
            }
            if (this.presele.value == 1) {

                this.vehName.value = 'Electric Vehicle';

                this.maxTtq.value = '240';
                this.maxPe.value = '75';

                this.inputN[0].value = '1000';
                this.inputN[1].value = '2500';
                this.inputN[2].value = '3500';
                this.inputN[3].value = '4500';
                this.inputN[4].value = '5500';
                this.inputN[5].value = '6500';
                this.inputN[6].value = '7000';
                this.inputN[7].value = '7500';

                this.inputB0[0].value = '65.0';
                this.inputB0[1].value = '65.0';
                this.inputB0[2].value = '65.0';
                this.inputB0[3].value = '65.0';
                this.inputB0[4].value = '65.0';
                this.inputB0[5].value = '65.0';
                this.inputB0[6].value = '65.0';
                this.inputB0[7].value = '65.0';

                this.inputB1[0].value = '0.62504';
                this.inputB1[1].value = '0.76989';
                this.inputB1[2].value = '0.86200';
                this.inputB1[3].value = '0.83407';
                this.inputB1[4].value = '0.74500';
                this.inputB1[5].value = '1.1533';
                this.inputB1[6].value = '1.2200';
                this.inputB1[7].value = '1.2213';

                this.inputB2[0].value = '-7.2265e-3';
                this.inputB2[1].value = '-8.2837e-3';
                this.inputB2[2].value = '-1.0620e-2';
                this.inputB2[3].value = '-1.0172e-2';
                this.inputB2[4].value = '-5.7000e-3';
                this.inputB2[5].value = '-2.4933e-2';
                this.inputB2[6].value = '-2.8800e-2';
                this.inputB2[7].value = '-2.8895e-2';

                this.inputB3[0].value = '3.3265e-5';
                this.inputB3[1].value = '3.6587e-5';
                this.inputB3[2].value = '5.7200e-5';
                this.inputB3[3].value = '5.5311e-5';
                this.inputB3[4].value = '-7.9999e-6';
                this.inputB3[5].value = '2.6666e-4';
                this.inputB3[6].value = '3.2000e-4';
                this.inputB3[7].value = '3.2208e-4';

                this.inputB4[0].value = '-5.5043e-8';
                this.inputB4[1].value = '-5.7393e-8';
                this.inputB4[2].value = '-1.1199e-7';
                this.inputB4[3].value = '-1.0998e-7';
                this.inputB4[4].value = '1.60000e-7';
                this.inputB4[5].value = '-1.0666e-6';
                this.inputB4[6].value = '-1.2799e-6';
                this.inputB4[7].value = '-1.2939e-6';

                this.transRats[0].value = '';
                this.transRats[1].value = '';
                this.transRats[2].value = '';
                this.transRats[3].value = '';
                this.transRats[4].value = '';

                this.mainRat.value = '6.058';

                this.engineSpeeds[0].value = '3000';
                this.engineSpeeds[1].value = '10000';

                this.mechEffi.value = '0.8';

                this.radius.value = '0.301';

                this.coeAir.value = '0.284';

                this.area.value = '1.97';

                this.quality.value = '1200.0';
            }
        }
        getData() {

            this.dtMaxTtq = parseFloat(this.maxTtq.value);
            this.dtMaxPe = parseFloat(this.maxPe.value);
            this.dtEngineSpeeds[0] = parseFloat(this.engineSpeeds[0].value);
            this.dtEngineSpeeds[1] = parseFloat(this.engineSpeeds[1].value);

            if (isNaN(this.dtMaxTtq) || isNaN(this.dtMaxPe) || isNaN(this.dtEngineSpeeds[0]) || isNaN(this.dtEngineSpeeds[1])) {
                return alert('至少输入 最大转矩、最大功率、额定转速、最大转速 数据\n可选择预选输入参数');
            }


            this.dtTransRats.splice(0, this.dtTransRats.length);
            if (this.transRats[0].value == '' && this.transRats[1].value == '' && this.transRats[2].value == '' && this.transRats[3].value == '' && this.transRats[4].value == '') {
                this.dtTransRats[0] = 1;
            } else {
                for (let i = 0; i < this.transRats.length; i++) {
                    this.dtTransRats.push(parseFloat(this.transRats[i].value));
                }
            }
            this.dtTransRats = this.dtTransRats.delNaN();

            this.dtMainRat = parseFloat(this.mainRat.value);
            this.dtMechEffi = parseFloat(this.mechEffi.value);
            this.dtRadius = parseFloat(this.radius.value); //车轮半径
            this.dtCoeAir = parseFloat(this.coeAir.value); //空阻系数
            this.dtArea = parseFloat(this.area.value); //迎风面积
            this.dtQuality = parseFloat(this.quality.value); //整车质量

            this.dtNBs.splice(0, this.dtNBs.length); //清除数组
            for (let i = 0; i < 8; i++) {
                this.dtNBs.push([parseFloat(this.inputN[i].value), parseFloat(this.inputB0[i].value), parseFloat(this.inputB1[i].value), parseFloat(this.inputB2[i].value), parseFloat(this.inputB3[i].value), parseFloat(this.inputB4[i].value)]) //转速对应拟合系数数据
            }
            this.dtNBs = this.dtNBs.delNaNs(); //清除成对的nan数组元素

            this.selePlot.disabled = false;
        }


        changePlot(that) {
            if (isNaN(that.dtMaxTtq) || isNaN(that.dtMaxPe) || isNaN(that.dtEngineSpeeds[0]) || isNaN(that.dtEngineSpeeds[1])) return;
            if (this.value == 0) {
                that.putEnginePlot();
            }
            if (this.value == 1) {
                that.putBPlot();
            }
            if (this.value == 2) {
                that.putFPlot();
            }
            if (this.value == 3) {
                that.putPPlot();
            }
            if (this.value == 4) {
                that.putPPPlot();
            }
            if (this.value == 5) {
                that.putAPlot();
            }
            if (this.value == 6) {
                that.putAAPlot();
            }
            if (this.value == 7) {
                that.putIPlot();
            }
            if (this.value == 8) {
                that.putRadar();
            }
            if (this.value == 9) {
                that.putTPlot();
            }
            if (this.value == 10) {
                that.putQsPlot();
            }

        }

        putEnginePlot() {
            this.enginePlot.title.text = `${this.vehName.value} 电机 驱动电机特性曲线`;
            this.enginePlot.series[0].data = this.peData();
            this.enginePlot.series[1].data = this.ttqData();
            this.myChart.setOption(this.enginePlot, true);
        }

        putFPlot() {
            this.fPlot.title.text = `${this.vehName.value} 汽车 驱动力-行驶阻力平衡图`;
            this.fPlot.series[0].data = this.fffwData();
            for (let i = 0; i < this.transRats.length; i++) {
                this.fPlot.series[i + 1].name = ``;
                this.fPlot.series[i + 1].data = '';
            }
            for (let i = 0; i < this.dtTransRats.length; i++) {
                this.fPlot.series[i + 1].name = `Ft${i+1}`;
                this.fPlot.series[i + 1].data = this.ftUaData(i);
            }

            this.myChart.setOption(this.fPlot, true);
        }

        putPPlot() {
            this.pPlot.title.text = `${this.vehName.value} 汽车 功率平衡图`;
            this.pPlot.series[0].data = this.pfPwData();
            for (let i = 0; i < this.transRats.length; i++) {
                this.pPlot.series[i + 1].name = ``;
                this.pPlot.series[i + 1].data = '';
            }
            for (let i = 0; i < this.dtTransRats.length; i++) {
                this.pPlot.series[i + 1].name = `Pe${i+1}`;
                this.pPlot.series[i + 1].data = this.peUaData(i);
            }

            this.myChart.setOption(this.pPlot, true);
        }

        putPPPlot() {
            this.ppPlot.title.text = `${this.vehName.value} 汽车 后备功率曲线`;
            for (let i = 0; i < this.transRats.length; i++) {
                this.ppPlot.series[i].name = ``;
                this.ppPlot.series[i].data = '';
            }
            for (let i = 0; i < this.dtTransRats.length; i++) {
                this.ppPlot.series[i].name = `Pe${i+1}`;
                this.ppPlot.series[i].data = this.ppeUaData(i);
            }

            this.myChart.setOption(this.ppPlot, true);
        }

        putAPlot() {
            this.aPlot.title.text = `${this.vehName.value} 汽车 加速度曲线`;
            for (let i = 0; i < this.transRats.length; i++) {
                this.aPlot.series[i].name = ``;
                this.aPlot.series[i].data = '';
            }
            for (let i = 0; i < this.dtTransRats.length; i++) {
                this.aPlot.series[i].name = `a${i+1}`;
                this.aPlot.series[i].data = this.aUaData(i);
            }

            this.myChart.setOption(this.aPlot, true);
        }
        putAAPlot() {
            this.aaPlot.title.text = `${this.vehName.value} 汽车 加速度倒数曲线`;

            for (let i = 0; i < this.transRats.length; i++) {
                this.aaPlot.series[i].name = ``;
                this.aaPlot.series[i].data = '';
            }
            for (let i = 0; i < this.dtTransRats.length; i++) {
                this.aaPlot.series[i].name = `1/a${i+1}`;
                this.aaPlot.series[i].data = this.aaUaData(i);
            }

            this.myChart.setOption(this.aaPlot, true);
        }

        putIPlot() {
            this.iPlot.title.text = `${this.vehName.value} 汽车 爬坡度曲线`;
            for (let i = 0; i < this.transRats.length; i++) {
                this.iPlot.series[i].name = '';
                this.iPlot.series[i].data = '';
            }
            for (let i = 0; i < this.dtTransRats.length; i++) {
                this.iPlot.series[i].name = `${i+1}档`;
                this.iPlot.series[i].data = this.iUaData(i);
            }

            this.myChart.setOption(this.iPlot, true);
        }
        putBPlot() {
            this.bPlot.title.text = `${this.vehName.value} 电机 电机效率曲线`;
            for (let i = 0; i < 8; i++) {
                this.bPlot.series[i].name = ``;
                this.bPlot.series[i].data = '';
            }
            for (let i = 0; i < this.dtNBs.length; i++) {
                this.bPlot.series[i].name = `b${this.dtNBs[i][0]}`;
                this.bPlot.series[i].data = this.bTtqData(i);
            }

            this.myChart.setOption(this.bPlot, true);
        }

        putQsPlot() {
            this.qsPlot.title.text = `${this.vehName.value} 汽车 能量消耗率曲线`;

            for (let i = 0; i < this.transRats.length; i++) {
                this.qsPlot.series[i].name = ``;;
                this.qsPlot.series[i].data = '';
            }
            for (let i = 0; i < this.dtTransRats.length; i++) {
                this.qsPlot.series[i].name = `${i+1}挡`;;
                this.qsPlot.series[i].data = this.qsData(i);
            }

            this.myChart.setOption(this.qsPlot, true);

        }



        putRadar() {
            this.radar.title.text = `${this.vehName.value} 综合性能雷达图`;

            this.radar.radar.indicator[0].name = `最高车速(km/h)`;
            this.radar.radar.indicator[1].name = `最大爬坡度(1/%),对应车速${this.iUaMaxData(0)[0]}(km/h)`;
            this.radar.radar.indicator[2].name = `峰值扭矩(N.m),对应转速${this.ttqMaxData()[0]}(r/min)`;
            this.radar.radar.indicator[3].name = `峰值功率(kw),对应转速${this.peMaxData()[0]}(r/min)`;
            this.radar.radar.indicator[4].name = `0——100加速时间(s)`;
            this.radar.radar.indicator[5].name = `90km/h能量消耗率(W.h/km)`;
            this.radar.series[0].data[0].value = [, , , , , ];


            this.radar.radar.indicator[0].name = `最高车速(km/h)`;
            this.radar.radar.indicator[1].name = `最大爬坡度(1/%),对应车速${this.iUaMaxData(0)[0]}(km/h)`;
            this.radar.radar.indicator[2].name = `峰值扭矩(N.m),对应转速${this.ttqMaxData()[0]}(r/min)`;
            this.radar.radar.indicator[3].name = `峰值功率(kw),对应转速${this.peMaxData()[0]}(r/min)`;
            this.radar.radar.indicator[4].name = `0——100加速时间(s)`;
            this.radar.radar.indicator[5].name = `90km/h能量消耗率(W.h/km)`;
            if (this.dtNBs.length == 8) {
                this.radar.series[0].data[0].value = [this.UaMaxData(this.dtTransRats.length - 1), this.iUaMaxData(0)[1], this.ttqMaxData()[1], this.peMaxData()[1], this.tUaData(), this.qsFun(90, this.dtTransRats.length - 1)];
            } else {
                this.radar.series[0].data[0].value = [this.UaMaxData(this.dtTransRats.length - 1), this.iUaMaxData(0)[1], this.ttqMaxData()[1], this.peMaxData()[1], this.tUaData(), ];

            }
            this.myChart.setOption(this.radar, true);
        }

        putTPlot() {
            this.tPlot.title.text = `${this.vehName.value} 汽车 加速时间曲线`;

            this.tPlot.series[0].name = ``;
            this.tPlot.series[0].data = '';

            this.tPlot.series[0].name = `加速时间`;
            this.tPlot.series[0].data = this.aafUaData();

            this.myChart.setOption(this.tPlot, true);
        }



        peFun(n) {
            let pe;
            if (n < this.dtEngineSpeeds[0]) {
                pe = n * this.dtMaxPe / this.dtEngineSpeeds[0];
            } else if (n >= this.dtEngineSpeeds[0]) {
                pe = this.dtMaxPe;
            }
            return Math.round(pe * 100) / 100;
        }
        peData() { //功率数据数据
            let data = [];
            for (let n = 0; n <= this.dtEngineSpeeds[1]; n += 10) {
                data.push([n, this.peFun(n)]);
            }
            return data;
        }
        peMaxData() { //发动机最大功率和其转速
            let data = [];
            let max = 0;
            for (let n = 0; n <= this.dtEngineSpeeds[1]; n += 10) {
                if (this.peFun(n) > max) {
                    data.push(n);
                    data.push(this.peFun(n));
                    max = this.peFun(n);
                }
            }
            return [data[data.length - 2], data[data.length - 1]];
        }
        ttqFun(n) {
            let ttq;
            if (n < this.dtEngineSpeeds[0]) {
                ttq = this.dtMaxTtq;
            } else if (n >= this.dtEngineSpeeds[0]) {
                ttq = this.dtMaxPe * 9550 / n
            }
            return Math.round(ttq * 100) / 100;
        }
        ttqData() { //转矩数据
            let data = [];
            for (let n = 0; n <= this.dtEngineSpeeds[1]; n += 10) {
                data.push([n, this.ttqFun(n)]);
            }
            return data;
        }
        ttqMaxData() { //发动机最大转矩和其车速
            let data = [];
            let max = 0;
            for (let n = 0; n <= this.dtEngineSpeeds[1]; n += 10) {
                if (this.ttqFun(n) > max) {
                    data.push(n);
                    data.push(this.ttqFun(n));
                    max = this.ttqFun(n);
                }
            }
            return [data[data.length - 2], data[data.length - 1]];
        }
        nUaFun(ua, i) { //第i档位转速和车速的关系
            let n = this.dtMainRat * this.dtTransRats[i] * ua / (0.377 * this.dtRadius)
            return n;
        }
        ttqUaFun(ua, i) { //各档转矩和车速函数
            let ttq;
            if (this.nUaFun(ua, i) < this.dtEngineSpeeds[0]) {
                ttq = this.dtMaxTtq;
            } else if (this.nUaFun(ua, i) >= this.dtEngineSpeeds[0]) {
                ttq = this.dtMaxPe * 9550 / this.nUaFun(ua, i)
            }
            return Math.round(ttq * 100) / 100;
        }

        ftUaFun(ua, i) { //各档驱动力和车速函数
            let ft = this.ttqUaFun(ua, i) * this.dtMainRat * this.dtTransRats[i] * this.dtMechEffi / this.dtRadius;
            return Math.round(ft);
        }

        ftUaData(i) { //各档驱动力和车速数据
            let data = [];
            for (let ua = 0; ua <= this.uaMaxFun(i); ua += 1) {
                data.push([ua, this.ftUaFun(ua, i)]);
            }
            return data;
        }




        peUaFun(ua, i) { //各档发动机功率和车速函数
            let peUa = this.ttqUaFun(ua, i) * this.nUaFun(ua, i) / 9550;
            return Math.round(peUa * 100) / 100;
        }

        peUaData(i) { //各档功率和车速数据
            let data = [];
            for (let ua = 0; ua <= this.uaMaxFun(i); ua += 1) {
                data.push([ua, this.peUaFun(ua, i)]);
            }
            return data;
        }

        ppeUaFun(ua, i) { //各档发动机后备功率和车速函数
            let peUa = this.ttqUaFun(ua, i) * this.nUaFun(ua, i) / 9550 - this.pfPwFun(ua);
            return Math.round(peUa * 100) / 100;
        }

        ppeUaData(i) { //各档后备功率和车速数据
            let data = [];
            for (let ua = 0; ua <= this.uaMaxFun(i); ua += 1) {
                if (this.ppeUaFun(ua, i) >= 0) {
                    data.push([ua, this.ppeUaFun(ua, i)]);
                }
            }
            return data;
        }

        UaMaxData(i) { //最大车速，考虑阻力
            let data = [];
            for (let ua = 0; ua <= this.uaMaxFun(i); ua += 1) {
                if (this.ppeUaFun(ua, i) >= 0) {
                    data.push(ua);
                }
            }
            return data[data.length - 1];
        }

        aUaFun(ua, i) { //各档加速度和车速函数
            let a = (this.ftUaFun(ua, i) - this.ffFun(ua) - this.fwFun(ua)) / this.dtQuality;
            return Math.round(a * 1000) / 1000;
        }


        aaUaFun(ua, i) { //各档加速度倒数和车速函数
            let a = this.ftUaFun(ua, i) / this.dtQuality;
            return Math.round((1 / a) * 1000) / 1000;
        }

        aUaData(i) { //各档加速度和车速数据
            let data = [];
            for (let ua = 0; ua <= this.uaMaxFun(i); ua += 1) {
                data.push([ua, this.aUaFun(ua, i)]);
            }
            return data;
        }
        aaUaData(i) { //各档加速度倒数和车速数据
            let data = [];
            for (let ua = 0; ua <= this.uaMaxFun(i); ua += 1) {
                data.push([ua, this.aaUaFun(ua, i)]);
            }
            return data;
        }

        aafUaFun(ua, i) { //各档加速度倒数(力计算中包括阻力)和车速函数
            let aa = 1 / (((this.ftUaFun(ua, i) - this.fffwFun(ua)) / this.dtQuality) * 3.6);
            return aa;
        }

        aafUaData() { //各档加速度倒数(力计算中包括阻力)和车速数据
            let data = [],
                i = 0,
                t = 0;
            for (let ua = 0; ua <= this.UaMaxData(this.dtTransRats.length - 1); ua += 1) {
                if (i < (this.dtTransRats.length - 1) && this.ftUaFun(ua, i + 1) > this.ftUaFun(ua, i)) {
                    i++;
                }
                t += this.aafUaFun(ua, i);
                data.push([ua, Math.round(t * 100) / 100]);
            }
            return data;
        }

        tUaData() { //0-100加速时间
            let
                i = 0,
                t = 0;
            for (let ua = 0; ua <= 100; ua += 1) {
                if (i < (this.dtTransRats.length - 1) && this.ftUaFun(ua, i + 1) > this.ftUaFun(ua, i)) {
                    i++;
                }
                t += this.aafUaFun(ua, i);

            }
            return Math.round(t * 100) / 100;
        }

        iUaFun(ua, i) { //各档爬坡度和车速函数
            let iUa = Math.tan(Math.asin((this.ftUaFun(ua, i) - this.ffFun(ua) - this.fwFun(ua)) / (this.dtQuality * this.dtG)));
            return Math.round(iUa * 1000) / 10;
        }

        iUaData(i) { //各档爬坡度和车速数据
            let data = [];
            for (let ua = 0; ua <= this.uaMaxFun(i); ua += 1) {
                if (this.iUaFun(ua, i) >= 0) {
                    data.push([ua, this.iUaFun(ua, i)]);
                }
            }
            return data;
        }

        iUaMaxData(i) { //对应档位的最大爬坡度和其车速
            let data = [];
            let max = 0;
            for (let ua = 0; ua <= this.uaMaxFun(i); ua += 1) {
                if (this.iUaFun(ua, i) > max) {
                    data.push(ua);
                    data.push(this.iUaFun(ua, i));
                    max = this.iUaFun(ua, i);
                }
            }
            return [data[data.length - 2], data[data.length - 1]];
        }

        uaMaxFun(i) { //对应档位的最高车速
            let uaMax = 0.377 * this.dtRadius * this.dtEngineSpeeds[1] / (this.dtMainRat * this.dtTransRats[i]);
            return Math.round(uaMax);
        }

        fCoeFun(ua) { //滚阻系数函数
            let fCoe = 0.0041 + 0.0000256 * ua; //此公式为经验公式
            return fCoe;
        }

        ffFun(ua) { //滚阻函数
            let ff = this.dtQuality * this.dtG * this.fCoeFun(ua);
            return Math.round(ff);
        }

        // ffData() { //滚阻数据
        //     let data = [];
        //     for (let ua = 0; ua <= 300; ua += 5) {
        //         data.push([ua, this.ffFun(ua)]);
        //     }
        //     return data;
        // }

        fwFun(ua) { //风阻函数
            let fw = this.dtCoeAir * this.dtArea * Math.pow(ua, 2) / 21.15;
            return Math.round(fw);
        }

        // fwData() {//风阻数据
        //     let data = [];
        //     for (let ua = 0; ua <= 300; ua += 5) {
        //         data.push([ua, this.fwFun(ua)]);
        //     }
        //     return data;
        // }

        fffwFun(ua) { //风阻加滚阻函数
            let fffw = this.fwFun(ua) + this.ffFun(ua);
            return fffw;
        }

        fffwData() { //风阻加滚阻数据
            let data = [];
            for (let ua = 0; ua <= this.uaMaxFun(this.dtTransRats.length - 1) + 20; ua += 1) {
                data.push([ua, this.fffwFun(ua)]);
            }
            return data;
        }

        pfPwFun(ua) { //风阻加滚阻功率函数
            let pfPw = this.ffFun(ua) * ua / 3600 + this.fwFun(ua) * ua / 3600;
            return Math.round((pfPw / this.dtMechEffi) * 100) / 100;
        }

        pfPwData() { //风阻加滚阻功率数据
            let data = [];
            for (let ua = 0; ua <= this.uaMaxFun(this.dtTransRats.length - 1) + 20; ua += 1) {
                data.push([ua, this.pfPwFun(ua)]);
            }
            return data;
        }

        bTtqFun(ttq, n0) { //各转速电机效率函数
            let b = 0;
            for (let i = 0; i < 5; i++) {
                b += this.dtNBs[n0][i + 1] * Math.pow(ttq, i)
            }
            return Math.round(b * 100) / 100;
        }
        bTtqData(n0) { //各转速电机效率数据
            let data = [];
            for (let ttq = 0; ttq <= this.ttqFun(this.dtNBs[n0][0]); ttq += 1) {
                data.push([ttq, this.bTtqFun(ttq, n0)]);
            }
            return data;
        }

        bFun(ua, i) { //算出对应车速,对应档位的电机效率系数
            let x;
            let b = [];
            let n = this.nUaFun(ua, i);
            if (this.dtNBs[0][0] > n || this.dtNBs[this.dtNBs.length - 1][0] < n) {
                alert('该车速对应发动机转速未包含在输入的燃油消耗率拟合数据组中，无法计算百公里燃油消耗量曲线')
                return;
            }
            for (let i = 0; i < this.dtNBs.length; i++) {
                if (this.dtNBs[i][0] < n && this.dtNBs[i + 1][0] > n) {
                    x = (this.dtNBs[i][0] - n) / (this.dtNBs[i][0] - this.dtNBs[i + 1][0]);
                    b[0] = this.dtNBs[i][1] - x * (this.dtNBs[i][1] - this.dtNBs[i + 1][1])
                    b[1] = this.dtNBs[i][2] - x * (this.dtNBs[i][2] - this.dtNBs[i + 1][2])
                    b[2] = this.dtNBs[i][3] - x * (this.dtNBs[i][3] - this.dtNBs[i + 1][3])
                    b[3] = this.dtNBs[i][4] - x * (this.dtNBs[i][4] - this.dtNBs[i + 1][4])
                    b[4] = this.dtNBs[i][5] - x * (this.dtNBs[i][5] - this.dtNBs[i + 1][5])
                    return b;
                }

            }
        }
        bbPeFun(ua, i) { //对应车速的对应档位车速的电机效率
            let b;
            b = this.bFun(ua, i)[0] + this.bFun(ua, i)[1] * this.pfPwFun(ua) + this.bFun(ua, i)[2] * Math.pow(this.pfPwFun(ua), 2) + this.bFun(ua, i)[3] * Math.pow(this.pfPwFun(ua), 3) + this.bFun(ua, i)[4] * Math.pow(this.pfPwFun(ua), 4);
            return Math.round(b * 100) / 100;
        }

        qsFun(ua, i) { //能耗函数
            let qs;
            qs = 1000 * this.pfPwFun(ua) / (ua * this.bbPeFun(ua, i) * 0.01);
            return Math.round(qs * 100) / 100;
        }

        qsData(i) { //对应档位的能耗曲线
            let data = [];
            for (let ua = this.uaMiFun(i) + 1; ua <= this.uaMaFun(i) - 1; ua += 1) {
                data.push([ua, this.qsFun(ua, i)]);
            }
            return data;
        }

        uaMaFun(i) { //对应档位的最高车速（拟合系数输入框）
            let uaMax = 0.377 * this.dtRadius * this.dtNBs[this.dtNBs.length - 1][0] / (this.dtMainRat * this.dtTransRats[i]);
            return Math.round(uaMax);
        }
        uaMiFun(i) { //对应档位的最低车速（拟合系数输入框）
            let uaMax = 0.377 * this.dtRadius * this.dtNBs[0][0] / (this.dtMainRat * this.dtTransRats[i]);
            return Math.round(uaMax);
        }
    }

    Array.prototype.delNaN = function () { //删除数组空元素
        let arr = [];
        if (this.every(function (element) { //判断二维数组
                return element.length == 2;
            })) {
            if (this[0].length == 2) { //判断2阶数的长度
                for (let i = 0; i < this.length; i++) {
                    if (this[i][0] === this[i][0] && this[i][1] === this[i][1]) {
                        arr.push(this[i]);
                    }
                }
            }
        } else {
            for (var i = 0; i < this.length; i++) {
                if (this[i] === this[i]) {
                    arr.push(this[i]);
                }
            }
        }

        return arr;
    }

    Array.prototype.delNaNs = function () { //删除数组空元素
        let arr = [];
        for (let i = 0; i < this.length; i++) {
            if (
                this[i][0] === this[i][0] && this[i][1] === this[i][1] && this[i][2] === this[i][2] && this[i][3] === this[i][3] && this[i][4] === this[i][4] && this[i][5] === this[i][5]
            ) {
                arr.push(this[i]);
            }
        }
        return arr;
    }

    //添加燃油车html
    function addNewFHtml() {
        document.documentElement.scrollTop = 0;
        let newHtml = `<section class="fuel_sec w box_style" id="F${i}"">
        <div class="typeTitle">燃油车</div>
<div class="fuel_left_div">
            <table class="fuel_left_table">
                <tr>
                    <td>

                    </td>
                    <td colspan="2">预选车辆</td>
                    <td><select name="presele" class="presele">
                        <option value="0">--手动输入--</option>
                        <option value="4">汽车理论 p302</option>
                        <option value="1">大众 Golf V</option>
                        <option value="2">沃尔沃 S80 D5</option>
                        <option value="3">蓝旗亚 Ypsilon 1.3</option>
                        </select>
                    </td>
                    <td></td>
                    <td>车辆名称</td>
                    <td><input type="text" name="veh_name" class="veh_name" value="" placeholder=""></td>
                </tr>
                <tr height = "15">
                
                <td colspan="7">
                <hr color = "lightgray" size = "6">
                </td>
                </tr>
                <tr>
                    <td><span class="iconfont icon-help">
                            <div class="tip">
                                该数据作为发动机动力性的重要计算数据。输入的拟合系数越多，计算结果越接近真实值。拟合公式：Ttq=a0+a1n+a2n²+a3n³+......
                            </div>
                        </span></td>

                    <td>
                        <label for="coe">拟合系数</label><input type="radio" name="mode${i}" value="0" class="radio" checked id="coe">
                    </td>


                    <td></td>
                    <td colspan="4">
                        <input type="number" class="coe_a" value="" step="0.00001">
                        <input type="number" class="coe_a" value="" step="0.00001">
                        <input type="number" class="coe_a" value="" step="0.00001">
                        <input type="number" class="coe_a" value="" step="0.00001">
                        <input type="number" class="coe_a" value="" step="0.00001">
                        <input type="number" class="coe_a" value="" step="0.00001">
                        <input type="number" class="coe_a" value="" step="0.00001">
                        <input type="number" class="coe_a" value="" step="0.00001">
                    </td>
                </tr>

                <tr>
                    <td rowspan="2"><span class="iconfont icon-help">
                            <div class="tip">
                                该数据作为发动机动力性的重要计算数据。发动机转速和转矩应成组输入，且均为已输入时，程序才会将改组记为有效组并引用计算。输入组数越多，转速区间分配越均匀，计算得到的拟合系数越接近真实值。
                            </div>
                        </span></td>
                    <td rowspan="2">
                        <label for="fitting">转速转矩拟合</label><input type="radio" name="mode${i}" value="1" class="radio" id="fitting">
                    </td>

                    <td>转矩(N.m)</td>
                    <td colspan="4">
                        <input type="number" class="input_ttq" value="" step="0.00001">
                        <input type="number" class="input_ttq" value="" step="0.00001">
                        <input type="number" class="input_ttq" value="" step="0.00001">
                        <input type="number" class="input_ttq" value="" step="0.00001">
                        <input type="number" class="input_ttq" value="" step="0.00001">
                        <input type="number" class="input_ttq" value="" step="0.00001">
                        <input type="number" class="input_ttq" value="" step="0.00001">
                        <input type="number" class="input_ttq" value="" step="0.00001">
                    </td>
                </tr>
                <tr>
                    <td>转速(n/min)</td>
                    <td colspan="4">
                        <input type="number" class="input_n" value="" step="0.00001">
                        <input type="number" class="input_n" value="" step="0.00001">
                        <input type="number" class="input_n" value="" step="0.00001">
                        <input type="number" class="input_n" value="" step="0.00001">
                        <input type="number" class="input_n" value="" step="0.00001">
                        <input type="number" class="input_n" value="" step="0.00001">
                        <input type="number" class="input_n" value="" step="0.00001">
                        <input type="number" class="input_n" value="" step="0.00001">
                    </td>

                </tr>
                <tr>
                    <td rowspan="5"><span class="iconfont icon-help">
                            <div class="tip">
                                该数据作为发动机经济性的重要计算数据，发动机转速和燃油消耗率(B0-B4)应成组输入，且均为已输入时，程序才会将改组数据记为有效组并引用计算。拟合公式：b=b0+b1n+b2n²+b3n³+......
                            </div>
                        </span></td>
                    <td rowspan="5">燃油消耗率拟合系数</td>

                    <td>B0</td>
                    <td colspan="4">
                        <input type="number" class="input_B0 input_b" value="" step="0.00001">
                        <input type="number" class="input_B0 input_b" value="" step="0.00001">
                        <input type="number" class="input_B0 input_b" value="" step="0.00001">
                        <input type="number" class="input_B0 input_b" value="" step="0.00001">
                        <input type="number" class="input_B0 input_b" value="" step="0.00001">
                        <input type="number" class="input_B0 input_b" value="" step="0.00001">
                        <input type="number" class="input_B0 input_b" value="" step="0.00001">
                        <input type="number" class="input_B0 input_b" value="" step="0.00001">
                    </td>
                </tr>
                <tr>
                    <td>B1</td>
                    <td colspan="4">
                        <input type="number" class="input_B1 input_b" value="" step="0.00001">
                        <input type="number" class="input_B1 input_b" value="" step="0.00001">
                        <input type="number" class="input_B1 input_b" value="" step="0.00001">
                        <input type="number" class="input_B1 input_b" value="" step="0.00001">
                        <input type="number" class="input_B1 input_b" value="" step="0.00001">
                        <input type="number" class="input_B1 input_b" value="" step="0.00001">
                        <input type="number" class="input_B1 input_b" value="" step="0.00001">
                        <input type="number" class="input_B1 input_b" value="" step="0.00001">
                    </td>
                </tr>
                <tr>
                    <td>B2</td>
                    <td colspan="4">
                        <input type="number" class="input_B2 input_b" value="" step="0.00001">
                        <input type="number" class="input_B2 input_b" value="" step="0.00001">
                        <input type="number" class="input_B2 input_b" value="" step="0.00001">
                        <input type="number" class="input_B2 input_b" value="" step="0.00001">
                        <input type="number" class="input_B2 input_b" value="" step="0.00001">
                        <input type="number" class="input_B2 input_b" value="" step="0.00001">
                        <input type="number" class="input_B2 input_b" value="" step="0.00001">
                        <input type="number" class="input_B2 input_b" value="" step="0.00001">
                    </td>
                </tr>
                <tr>
                    <td>B3</td>
                    <td colspan="4">
                        <input type="number" class="input_B3 input_b" value="" step="0.00001">
                        <input type="number" class="input_B3 input_b" value="" step="0.00001">
                        <input type="number" class="input_B3 input_b" value="" step="0.00001">
                        <input type="number" class="input_B3 input_b" value="" step="0.00001">
                        <input type="number" class="input_B3 input_b" value="" step="0.00001">
                        <input type="number" class="input_B3 input_b" value="" step="0.00001">
                        <input type="number" class="input_B3 input_b" value="" step="0.00001">
                        <input type="number" class="input_B3 input_b" value="" step="0.00001">
                    </td>
                </tr>
                <tr>
                    <td>B4</td>
                    <td colspan="4">
                        <input type="number" class="input_B4 input_b" value="" step="0.00001">
                        <input type="number" class="input_B4 input_b" value="" step="0.00001">
                        <input type="number" class="input_B4 input_b" value="" step="0.00001">
                        <input type="number" class="input_B4 input_b" value="" step="0.00001">
                        <input type="number" class="input_B4 input_b" value="" step="0.00001">
                        <input type="number" class="input_B4 input_b" value="" step="0.00001">
                        <input type="number" class="input_B4 input_b" value="" step="0.00001">
                        <input type="number" class="input_B4 input_b" value="" step="0.00001">
                    </td>
                </tr>
                
                <tr>
                    <td></td>
                    <td colspan="2">转速范围(n/min)</td>
                    <td colspan="1"><input type="number" class="engine_speed input_engspe" value="" step="0.00001">-<input type="number" class="engine_speed input_engspe" value="" step="0.00001"></td>
                    <td></td>
                    <td colspan="1">怠速油耗(mL/s)</td>
                    <td colspan="1"><input type="number" class="qid input_qid" value="" step="0.00001"></td>
                </tr>

                <tr height = "15">
            
                <td colspan="7">
                <hr color = "lightgray" size = "6">
                </td>
                </tr>

                <tr>
                    <td></td>
                    <td colspan="2">各前进挡传动比</td>
                    <td colspan="4">
                        <input type="number" class="tran_rat" value="" step="0.00001">
                        <input type="number" class="tran_rat" value="" step="0.00001">
                        <input type="number" class="tran_rat" value="" step="0.00001">
                        <input type="number" class="tran_rat" value="" step="0.00001">
                        <input type="number" class="tran_rat" value="" step="0.00001">
                        <input type="number" class="tran_rat" value="" step="0.00001">
                        <input type="number" class="tran_rat" value="" step="0.00001">
                        <input type="number" class="tran_rat" value="" step="0.00001">
                    </td>

                </tr>
                <tr>
                    <td></td>
                    <td colspan="2">主减速比</td>
                    <td><input type="number" class="main_rat" value="" step="0.00001"></td>
                    <td></td>
                    <td>传动效率</td>
                    <td><input type="number" class="mech_effi" value="" step="0.00001"></td>
                </tr>
                <tr>
                    <td><span class="iconfont icon-help">
                            <div class="tip">风阻系数的大小取决于汽车的外形，风阻系数愈大,则空气阻力愈大现代汽车的风阻系数一般在0.23-0.5之间</div>
                        </span></td>
                    <td colspan="2">空气阻力系数</td>
                    <td><input type="number" class="coe_air" value="" step="0.00001"></td>
                    <td></td>
                    <td>车轮半径(m)</td>
                    <td><input type="number" class="radius" value="" step="0.00001"></td>
                </tr>
                <tr>
                    <td></td>
                    <td colspan="2">迎风面积(m²)</td>
                    <td><input type="number" class="area" value="" step="0.00001"></td>
                    <td></td>
                    <td>车辆总质量(kg)</td>
                    <td><input type="number" class="quality" value="" step="0.00001"></td>
                </tr>
            </table>
            <div class="btn f_btn">
                <input type="button" value="&#xe67e;" class="res iconfont"><input type="button" value="&#xe665;" class="del iconfont">
            </div>
        </div>

        <div class="fuel_right_div">
            <select name="sele_plot" class="sele_plot">
                <optgroup label="------汽车综合性能分析------" class="optgroup"></optgroup>
                <option class="opt_plot" value="8">综合性能雷达图</option>
                <optgroup label="------动力性分析曲线------" class="optgroup"></optgroup>
                <option class="opt_plot" value="0">发动机 外特性功率-转矩曲线</option>
                <option class="opt_plot" value="2">汽车 驱动力-行驶阻力平衡图</option>
                <option class="opt_plot" value="3">汽车 功率平衡图</option>
                <option class="opt_plot" value="4">汽车 后备功率曲线</option>
                <option class="opt_plot" value="5">汽车 加速度曲线</option>
                <option class="opt_plot" value="6">汽车 加速度倒数曲线</option>
                <option class="opt_plot" value="9">汽车 加速时间曲线</option>
                <option class="opt_plot" value="7">汽车 爬坡度曲线</option>
                <optgroup label="------经济性分析曲线------" class="optgroup"></optgroup>
                <option class="opt_plot" value="1">发动机 负荷特性</option>
                <option class="opt_plot" value="10">汽车 等速燃油消耗量</option>
                <option class="opt_plot" value="11">汽车 NEDC循环工况测试曲线</option>
            </select>

            <div class="fuel_chart">
            </div>
        </div>
    </section>`;
        content.insertAdjacentHTML('afterBegin', newHtml);
        new FVeh(`#F${i++}`);
    }

    //添加电动车html
    function addNewEHtml() {
        document.documentElement.scrollTop = 0;
        let newHtml = `<section class="elec_sec w box_style" id="E${j}">
        <div class="typeTitle">电动车</div>
<div class="elec_left_div">
            <table class="elec_left_table">
                <tr>
                    <td>
                    </td>
                    <td colspan="2">预选车辆</td>
                    <td><select name="presele" class="presele">
                    <option value="0">--手动输入--</option>
                    <option value="1">Electric Vehicle</option>
                    </select>
                    </td>
                    <td></td>
                    <td>车辆名称</td>
                    <td><input type="text" name="veh_name" class="veh_name" value="" placeholder=""></td>
                </tr>
            
                <tr height = "15">
            
                <td colspan="7">
                <hr color = "lightgray" size = "6">
                </td>
                </tr>
                
                <tr>
                    <td></td>
                    <td colspan="2">最大转矩(N.m)</td>
                    <td><input type="number" class="max_ttq" value="" step="0.00001"></td>
                    <td></td>
                    <td>最大功率(kw)</td>
                    <td><input type="number" class="max_pe" value="" step="0.00001"></td>
                </tr>
                <tr>
                    <td></td>
                    <td colspan="2">额定转速(n/min)</td>
                    <td><input type="number" class="engine_speed" value="" step="0.00001"></td>
                    <td></td>
                    <td>最高转速(n/min)</td>
                    <td><input type="number" class="engine_speed" value="" step="0.00001"></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td>转速(n/min)</td>
                    <td colspan="4">
                        <input type="number" class="input_n" value="" step="0.00001">
                        <input type="number" class="input_n" value="" step="0.00001">
                        <input type="number" class="input_n" value="" step="0.00001">
                        <input type="number" class="input_n" value="" step="0.00001">
                        <input type="number" class="input_n" value="" step="0.00001">
                        <input type="number" class="input_n" value="" step="0.00001">
                        <input type="number" class="input_n" value="" step="0.00001">
                        <input type="number" class="input_n" value="" step="0.00001">
                    </td>

                </tr>

                <tr>
                    <td rowspan="5"><span class="iconfont icon-help">
                        <div class="tip">
                            该数据作为电机经济性的重要计算数据，电机转速和电机效率(C0-C4)应成组输入，且均为已输入时，程序才会将改组数据记为有效组并引用计算。输入组数越多，转速区间分配越均匀，计算结果越接近真实值。拟合公式：c=c0+c1n+c2n²+c3n³+......
                        </div>
                    </span></td>
                    <td rowspan="5">电机效率拟合系数</td>

                    <td>C0</td>
                    <td colspan="4">
                        <input type="number" class="input_B0 input_b" value="" step="0.00001">
                        <input type="number" class="input_B0 input_b" value="" step="0.00001">
                        <input type="number" class="input_B0 input_b" value="" step="0.00001">
                        <input type="number" class="input_B0 input_b" value="" step="0.00001">
                        <input type="number" class="input_B0 input_b" value="" step="0.00001">
                        <input type="number" class="input_B0 input_b" value="" step="0.00001">
                        <input type="number" class="input_B0 input_b" value="" step="0.00001">
                        <input type="number" class="input_B0 input_b" value="" step="0.00001">
                    </td>
                </tr>
                <tr>
                    <td>C1</td>
                    <td colspan="4">
                        <input type="number" class="input_B1 input_b" value="" step="0.00001">
                        <input type="number" class="input_B1 input_b" value="" step="0.00001">
                        <input type="number" class="input_B1 input_b" value="" step="0.00001">
                        <input type="number" class="input_B1 input_b" value="" step="0.00001">
                        <input type="number" class="input_B1 input_b" value="" step="0.00001">
                        <input type="number" class="input_B1 input_b" value="" step="0.00001">
                        <input type="number" class="input_B1 input_b" value="" step="0.00001">
                        <input type="number" class="input_B1 input_b" value="" step="0.00001">
                    </td>
                </tr>
                <tr>
                    <td>C2</td>
                    <td colspan="4">
                        <input type="number" class="input_B2 input_b" value="" step="0.00001">
                        <input type="number" class="input_B2 input_b" value="" step="0.00001">
                        <input type="number" class="input_B2 input_b" value="" step="0.00001">
                        <input type="number" class="input_B2 input_b" value="" step="0.00001">
                        <input type="number" class="input_B2 input_b" value="" step="0.00001">
                        <input type="number" class="input_B2 input_b" value="" step="0.00001">
                        <input type="number" class="input_B2 input_b" value="" step="0.00001">
                        <input type="number" class="input_B2 input_b" value="" step="0.00001">
                    </td>
                </tr>
                <tr>
                    <td>C3</td>
                    <td colspan="4">
                        <input type="number" class="input_B3 input_b" value="" step="0.00001">
                        <input type="number" class="input_B3 input_b" value="" step="0.00001">
                        <input type="number" class="input_B3 input_b" value="" step="0.00001">
                        <input type="number" class="input_B3 input_b" value="" step="0.00001">
                        <input type="number" class="input_B3 input_b" value="" step="0.00001">
                        <input type="number" class="input_B3 input_b" value="" step="0.00001">
                        <input type="number" class="input_B3 input_b" value="" step="0.00001">
                        <input type="number" class="input_B3 input_b" value="" step="0.00001">
                    </td>
                </tr>
                <tr>
                    <td>C4</td>
                    <td colspan="4">
                        <input type="number" class="input_B4 input_b" value="" step="0.00001">
                        <input type="number" class="input_B4 input_b" value="" step="0.00001">
                        <input type="number" class="input_B4 input_b" value="" step="0.00001">
                        <input type="number" class="input_B4 input_b" value="" step="0.00001">
                        <input type="number" class="input_B4 input_b" value="" step="0.00001">
                        <input type="number" class="input_B4 input_b" value="" step="0.00001">
                        <input type="number" class="input_B4 input_b" value="" step="0.00001">
                        <input type="number" class="input_B4 input_b" value="" step="0.00001">
                    </td>
                </tr>

                <tr height = "15">
            
                <td colspan="7">
                <hr color = "lightgray" size = "6">
                </td>
                </tr>
                <tr>
                    <td><span class="iconfont icon-help">
                    <div class="tip">当车辆档位数为一时，该项各输入框可留空，程序会默认给出传动比为1的唯一档位</div>
                </span></td>
                    <td colspan="2">各前进挡传动比</td>
                    <td colspan="4">
                        <input type="number" class="tran_rat" value="" step="0.00001">
                        <input type="number" class="tran_rat" value="" step="0.00001">
                        <input type="number" class="tran_rat" value="" step="0.00001">
                        <input type="number" class="tran_rat" value="" step="0.00001">
                        <input type="number" class="tran_rat" value="" step="0.00001">
                    </td>

                </tr>
                

                <tr>
                    <td></td>
                    <td colspan="2">主减速比</td>
                    <td><input type="number" class="main_rat" value="" step="0.00001"></td>
                    <td></td>
                    <td>传动效率</td>
                    <td><input type="number" class="mech_effi" value="" step="0.00001"></td>
                </tr>
                <tr>
                    <td><span class="iconfont icon-help">
                        <div class="tip">风阻系数的大小取决于汽车的外形，风阻系数愈大,则空气阻力愈大现代汽车的风阻系数一般在0.23-0.5之间</div>
                    </span></td>
                    <td colspan="2">空气阻力系数</td>
                    <td><input type="number" class="coe_air" value="" step="0.00001"></td>
                    <td></td>
                    <td>车轮半径(m)</td>
                    <td><input type="number" class="radius" value="" step="0.00001"></td>
                </tr>
                <tr>
                    <td></td>
                    <td colspan="2">迎风面积(m²)</td>
                    <td><input type="number" class="area" value="" step="0.00001"></td>
                    <td></td>
                    <td>车辆总质量(kg)</td>
                    <td><input type="number" class="quality" value="" step="0.00001"></td>
                </tr>
            </table>
            <div class="btn">
            <input type="button" value="&#xe67e;" class="res iconfont"><input type="button" value="&#xe665;" class="del iconfont">
            </div>
        </div>

        <div class="elec_right_div">
            <select name="sele_plot" class="sele_plot">
            <optgroup label="------汽车综合性能分析------" class="optgroup"></optgroup>
            <option class="opt_plot" value="8">综合性能雷达图</option>
            <optgroup label="------动力性分析曲线------" class="optgroup"></optgroup>
            <option class="opt_plot" value="0">电机 驱动电机特性曲线</option>
            <option class="opt_plot" value="2">汽车 驱动力-行驶阻力平衡图</option>
            <option class="opt_plot" value="3">汽车 功率平衡图</option>
            <option class="opt_plot" value="4">汽车 后备功率曲线</option>
            <option class="opt_plot" value="5">汽车 加速度曲线</option>
            <option class="opt_plot" value="6">汽车 加速度倒数曲线</option>
            <option class="opt_plot" value="9">汽车 加速时间曲线</option>
            <option class="opt_plot" value="7">汽车 爬坡度曲线</option>
            <optgroup label="------经济性分析曲线------" class="optgroup"></optgroup>
            <option class="opt_plot" value="1">电机 电机效率曲线</option>
            <option class="opt_plot" value="10">汽车 能量消耗率曲线</option>
        </select>
            <div class="elec_chart">
            </div>
        </div>
    </section>`;

        content.insertAdjacentHTML('afterBegin', newHtml);
        new EVeh(`#E${j++}`);
    }
    document.getElementById("add_f_btn").click(); //触发点击事件，初始化两个类
});