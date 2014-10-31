Aria.classDefinition({
    $classpath : "test.aria.widgets.form.datepicker.validation.DatePickerWithValidatorTest",
    $extends : "aria.jsunit.TemplateTestCase",
    $constructor : function () {
        this.$TemplateTestCase.constructor.call(this);
        this.setTestEnv({
            moduleCtrl : {
                classpath : "test.aria.widgets.form.datepicker.validation.DatePickerCtrl"
            }
        });
    },

    // TODO: ADD THIS TO SOME TEST SUITE WHEN READY
    $prototype : {
        runTemplateTest : function () {
            // this.fail("xxx");
        }
    }
});
