/*
 * Copyright 2012 Amadeus s.a.s.
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

{Template {
  $classpath : "test.aria.utils.dragdrop.fixedElements.FixedElementTestTemplate",
  $css : ["test.aria.utils.dragdrop.fixedElements.FixedElementStyle"]
} }

  {macro main ( )}

    <div id="draggable-fixed" class="modal fixed">
        <div class="title-bar">Fixed</div>
        Cannot move :(
    </div>
    <div id="draggable-absolute" class="modal absolute" style="right:50px;">
        <div class="title-bar">Absolute</div>
        Will move just fine
    </div>

{/macro}

{/Template}
