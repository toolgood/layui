
(function (layui, window, factory) {
    if (typeof exports === 'object') { // 支持 CommonJS
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) { // 支持 AMD
        define(factory);
    } else if (window.layui && layui.define) { //layui加载
        layui.define(['form'], function (exports) {
            exports('validator', factory());
        });
    } else {
        window.verifyInit = factory();
    }
})(typeof layui == 'undefined' ? null : layui, window, function () {
    form = layui.form;
    form.verify({
        numberOrempty: [
            /^\s*(\d*\.\d*|\d*\.?|\.?\d*)\s*$/
            ///^(\s*|\d+)$///前可空格任意 （数.数|数.|.数） 后可任意空格
            , '只能填写数字'
        ], username: function (value, item) { //value：表单的值、item：表单的DOM对象
            if (!new RegExp("^[a-zA-Z0-9_\u4e00-\u9fa5\\s·]{2,20}$").test(value)) {
                return '用户名不能有特殊字符';
            }
            if (/(^\_)|(\__)|(\_+$)/.test(value)) {
                return '用户名首尾不能出现下划线\'_\'';
            }
            if (/^\d+\d+\d$/.test(value)) {
                return '用户名不能全为数字';
            }
        },
        pass: [
            /^[\S]{6,20}$/,
            '密码必须6到12位，且不能出现空格'
        ],
        required: function (value, item) {
            if (!value) {
                return '该项为必填项';
            }
        },
        //电话
        tel: function (value, item) {
            var regx = /^[1][3, 5, 6, 7, 8][0-9]{9}$/;
            if (!regx.test(value)) {
                return '手机号码格式不正确！';
            }
        },
        idcard: function (value, item) {
            regx = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
            if (!regx.test(value)) {
                return "身份证格式不正确！";
            }
        }
    });

    form.verify({
        integer: [
            /^(\s*|\d+)$/
            , '只能填写整数'
        ],
        positive: function (value, item) { //value：表单的值、item：表单的DOM对象
            if (isNaN(Number(value))) {
                return '只能填写数字';
            }
            if (Number(value) <= 0) {
                return '只能填写正数';
            }
        }
    });
})