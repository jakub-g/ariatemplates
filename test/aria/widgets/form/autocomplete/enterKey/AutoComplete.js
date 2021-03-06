/*
 * Copyright 2013 Amadeus s.a.s.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

Aria.classDefinition({
    $classpath : "test.aria.widgets.form.autocomplete.enterKey.AutoComplete",
    $extends : "aria.jsunit.TemplateTestCase",
    $constructor : function () {
        this.$TemplateTestCase.constructor.call(this);
    },
    $prototype : {
        /**
         * This method is always the first entry point to a template test Start the test by focusing the first field.
         * Initially give the field focus.
         */
        runTemplateTest : function () {
            this.synEvent.click(this.getInputField("acDest"), {
                fn : this.onAcFocused,
                scope : this
            });
        },

        /**
         * Field should have focus, next trigger an exact match.
         */
        onAcFocused : function () {
            this.synEvent.type(this.getInputField("acDest"), "madrid", {
                fn : this.onDelay,
                scope : this
            });
        },

        /**
         * Need to add a delay to allow the list to open with the returned suggestions including the exact match.
         */
        onDelay : function () {
            aria.core.Timer.addCallback({
                fn : this.onAcEnter,
                scope : this,
                delay : 1000
            });
        },

        /**
         * Trigger the enter key using syn events to close the popup.
         */
        onAcEnter : function () {
            this.synEvent.type(this.getInputField("acDest"), '[enter]', {
                fn : this.finishTest,
                scope : this
            });
        },

        /**
         * Finalize the test, check the bound widgets value has been updated by a change to the data model when the
         * enter key was triggered.
         */
        finishTest : function () {
            var test = this.getInputField("tfDest");
            this.assertTrue(test.value === 'Madrid');
            this.notifyTemplateTestEnd();
        }
    }
});
