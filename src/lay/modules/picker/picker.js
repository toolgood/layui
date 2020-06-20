/**
 * plugin-name:picker.js
 *      author:Van
 *      e-mail:zheng_jinfan@126.com
 *   demo-site:http://m.zhengjinfan.cn/picker/index.html
 *    homepage:http://blog.zheng_jinfan.cn
 *  createtime:2017-07-25 16:55:36
 *  MIT License
 */
layui.define(['laytpl', 'form','area'], function(exports) {
    "use strict";
     var    layer = parent.layer === undefined ? layui.layer : parent.layer,
        Areas = layui.area, //数据
        form = layui.form,
        PROVINCE = 'province',
        CITY = 'city',
        AREA = 'area',
        PROVINCE_TIPS = '请选择省',
        CITY_TIPS = '请选择市',
        AREA_TIPS = '请选择县/区',
        pickerType = {
            province: 1, //省
            city: 2, //市
            area: 3 //区
        },
        DATA = [];
    var Picker = function() {
        //默认设置
        this.config = {
            elem: undefined, //存在的容器 支持类选择器和ID选择器  e.g: [.class]  or  [#id]
            codeConfig: undefined, //初始值 e.g:{ code:440104,type:3 } 说明：code 为代码，type为类型 1：省、2：市、3：区/县
            /**
             * {
                    "code": "654325",                   //代码
                    "name": "青河县",                    //名称
                    "type": 3,                          //类型，1：省、2：市、3：区/县
                    "path": "650000,654300,654325",     //路径： 省,市,区/县
                    "parentCode": "654300"              //父代码
                }
             */
            data: undefined, //数据源，需要特定的数据结构,
            canSearch: true, //是否支持搜索,
            type: ["province","city","area"] //显示内容 ["province","city","area"]
            // url: undefined,                          //远程地址，未用到
            // type: 'GET'                              //请求方式,未用到
        };
        this.v = '1.0.0';

        //渲染数据
    };
    Picker.fn = Picker.prototype;
    //设置
    Picker.fn.set = function(options) {
        var that = this;
        if (options.data) {
            DATA = options.data;
        } else {
            DATA = Areas;
        }
        $.extend(true, that.config, options);
        return that;
    };

    //渲染
    Picker.fn.render = function() {
        var that = this,
            thatType = that.config.type,
            typeLength = thatType.length,
            colWidth = (typeLength == 3) ? 4 : (typeLength == 2) ? 6 :12
        ;
        var config = that.config,
            cache = {},
            $elem = $(config.elem),
            getDatas = function(type, parentCode, selectCode) {
                if (DATA.length === 0)
                    throw new Error('PICKER ERROR:请设置数据源.');
                var data = [];
                var result = [];
                var areaCode;
                cache["parentCode" + type] = parentCode;
                if(type == 3) {
                    areaCode = parentCode;
                    parentCode = cache["parentCode2"];
                }

                $(DATA).each(function(index1, item1) {
                    //获取全部省
                    if(type == 1) { data.push({code:item1.provinceCode,name:item1.provinceName}) };
                    //获取选择省
                    if(item1.provinceCode == parentCode) {
                        $(item1.mallCityList).each(function(index2, item2) {
                            // 获取选中省的市
                            if(type == 2){ data.push({code:item2.cityCode,name:item2.cityName}) };
                            // 获取选择市
                            if(item2.cityCode == areaCode){
                                $(item2.mallAreaList).each(function(index3, item3) {
                                    // 获取地区
                                    if(type == 3){ data.push({code:item3.areaCode,name:item3.areaName}) };

                                });
                            }
                        });
                    }
                });

                for (var i = 0; i < data.length; i++) {
                    var e = data[i];

                        var isSelected = selectCode == e.code;
                        result.push({
                            code: e.code,
                            name: e.name,
                            isSelected: isSelected
                        });

                }
                return result;
            },
            getAreaCodeByCode = function(options) { //获取code值
                if (DATA.length === 0)
                    throw new Error('PICKER ERROR:请设置数据源.');
                var data = DATA,
                    result = undefined,
                    name = (options.name) ? options.name.split(",") : null,
                    code = (options.code) ? options.code.split(","): null,
                    codelength = name ? name.length : code.length,
                    codeArray= [],
                    nameArray = []
                ;

                function eachData(index,itemCode,itemName){ //判断条件
                    var isLength = (index == 0) ? codelength !== 0 : (index == 1) ? codelength >= 2 : codelength >= 3,
                        isCode = (code !== null && itemCode == code[index]),
                        isName = (name !== null && itemName == name[index])
                    ;
                    return isLength && (isCode || isName);
                };
                function resultAgg (code,name) { //添加值
                    codeArray.push(code);
                    nameArray.push(name);
                };

                $(data).each(function(index1, item1) {
                    if( eachData(0,item1.provinceCode,item1.provinceName) ) {

                        resultAgg(item1.provinceCode,item1.provinceName); // 获取省

                        $(item1.mallCityList).each(function(index2, item2) {

                            if (eachData(1,item2.cityCode,item2.cityName)) {

                                resultAgg(item2.cityCode,item2.cityName); // 获取市

                                $(item2.mallAreaList).each(function(index3, item3) {
                                    if (eachData(2,item3.areaCode,item3.areaName)) {

                                        resultAgg(item3.areaCode,item3.areaName); // 获取区
                                    };
                                });
                            };
                        });
                    }
                });

                result = {path: codeArray.join(","),pathName : nameArray.join(",")};
                return result;
            },
            tempContent = function(vid) {
                return '<form class="layui-form">' +
                    '<div class="layui-form-item" data-action="picker_' + vid + '">' +
                    // '<label class="layui-form-label">选择地区</label>' +
                    '</div>' +
                    '</form>';
            },
            temp = function(filterName, tipInfo) {
                var mdWidth = 'layui-col-md' + colWidth;
                var html = '<div class="'+ mdWidth +'" data-action="' + filterName + '">';
                if (config.canSearch) {
                    html += '<select name="' + filterName + '" lay-filter="' + filterName + '" lay-search>';
                } else {
                    html += '<select name="' + filterName + '" lay-filter="' + filterName + '">';
                }
                html += '<option value="">' + tipInfo + '</option>';
                html += '{{# layui.each(d, function(index, item){ }}';
                html += '{{# if(item.isSelected){ }}';
                html += '<option value="{{ item.code }}" selected>{{ item.name }}</option>';
                html += '{{# }else{ }}'
                html += '<option value="{{ item.code }}">{{ item.name }}</option>';
                html += '{{# }; }}';
                html += '{{#  }); }}';
                html += '</select>';
                html += '</div>';
                return html;
            },
            renderData = function(type, $picker, parentCode, selectCode, init,typename) {
                if($.inArray(typename, thatType) < 0 && typename !== undefined) return false;
                var tempHtml = '';
                var filter = '';
                init = init === undefined ? true : init;
                var pickerFilter = {
                    province: PROVINCE + that.config.vid,
                    city: CITY + that.config.vid,
                    area: AREA + that.config.vid
                };
                switch (type) {
                    case pickerType.province:
                        tempHtml = temp(pickerFilter.province, PROVINCE_TIPS);
                        filter = pickerFilter.province;
                        break;
                    case pickerType.city:
                        tempHtml = temp(pickerFilter.city, CITY_TIPS);
                        filter = pickerFilter.city;
                        break;
                    case pickerType.area:
                        tempHtml = temp(pickerFilter.area, AREA_TIPS);
                        filter = pickerFilter.area;
                        break;
                }
                layui.laytpl(tempHtml).render(getDatas(type, parentCode, selectCode), function(html) {
                    if (!init) {
                        var $has = $picker.find('div[data-action=' + filter + ']');
                        if ($has.length > 0) {
                            var $prev = $has.prev();
                            $prev.next().remove();
                            $prev.after(html);
                            if (filter == pickerFilter.city) {
                                var $hasArea = $picker.find('div[data-action=' + pickerFilter.area + ']');
                                if ($hasArea.length > 0) {
                                    $hasArea.find('select[name=' + pickerFilter.area + ']')
                                        .html('<option value="">请选择县/区</option>');
                                }
                            }
                        } else {
                            $picker.append(html);
                        }
                    } else {
                        $picker.append(html);
                    }
                    form.on('select(' + filter + ')', function(data) {
                        switch (data.elem.name) {
                            case pickerFilter.province:
                                renderData(pickerType.city, $picker, data.value, undefined, false,'city');
                                break;
                            case pickerFilter.city:
                                renderData(pickerType.area, $picker, data.value, undefined, false,'area');
                                break;
                            case pickerFilter.area:
                                break;
                        }
                    });
                    form.render('select');
                });
            };
        config.vid = new Date().getTime();
        $elem.html(tempContent(config.vid));
        var $picker = $elem.find('div[data-action=picker_' + config.vid + ']');
        //如果需要初始化
        if (config.codeConfig) {
            var pathAll = getAreaCodeByCode(config.codeConfig);
            var path = pathAll.path;
            var pType = config.codeConfig.type;
            var pCode = config.codeConfig.code;
            var arrPath = [];
            for (var i = 0; i < path.split(',').length; i++) {
                var e = path.split(',')[i];
                arrPath.push(e);
            }
            switch (pType) {
                case pickerType.province:
                    //渲染省
                    renderData(pickerType.province, $picker, null, arrPath[0]);
                    break;
                case pickerType.city:
                    //渲染省
                    renderData(pickerType.province, $picker, null, arrPath[0]);
                    //渲染市
                    renderData(pickerType.city, $picker, arrPath[0], arrPath[1]);
                    break;
                case pickerType.area:
                    //渲染省
                    renderData(pickerType.province, $picker, null, arrPath[0]);
                    //渲染市
                    renderData(pickerType.city, $picker, arrPath[0], arrPath[1]);
                    //渲染区/县
                    renderData(pickerType.area, $picker, arrPath[1], arrPath[2]);
                    break;
            }
        } else {

            $(thatType).each(function(index, item) {
                renderData(pickerType[item], $picker, null, undefined, true,item);
            });

            // //渲染省
            // renderData(pickerType.province, $picker, null, undefined, true);
            // //渲染市
            // renderData(pickerType.city, $picker, null, undefined, true);
            // //渲染区/县
            // renderData(pickerType.area, $picker, null, undefined, true);
        }

    };

    exports('picker', Picker);
});