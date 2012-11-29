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

/**
 * Interface exposed from the IO to the application. It is used by IO when using a transport.
 */
Aria.interfaceDefinition({
    $classpath : "aria.core.transport.ITransports",
    $interface : {
        /**
         * Initialization function.
         * @param {String} reqId request Id.
         */
        init : function (reqId) {},

        /**
         * Perform a request.
         * @param {aria.core.CfgBeans.IOAsyncRequestCfg} request Request object
         * @param {aria.core.CfgBeans.Callback} callback This callback is generated by IO so it's already normalized
         * @throws
         */
        request : function (request, callback) {}
    }
});
