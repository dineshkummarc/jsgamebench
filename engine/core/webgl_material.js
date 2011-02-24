// Copyright 2004-present Facebook. All Rights Reserved.

// Licensed under the Apache License, Version 2.0 (the "License"); you may
// not use this file except in compliance with the License. You may obtain
// a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

var WebGLMaterial = (function() {

    // constants
    var show_unloaded_materials = true;
    var ERROR_MAT_NAME = 'error';

    // error materials
    var error_material_type = {
      name : ERROR_MAT_NAME,
      vertex_shader : {
        attribute: {
          vposition : 'vec3',
          vtexcoord : 'vec2',
          vnormal : 'vec3'
        },

        uniform: {
          modelviewproj : 'mat4'
        },

        text: [
          'void main() {',
          '  vec4 hpos = vec4(vposition, 1);',
          '  gl_Position.x = dot(modelviewproj[0], hpos);',
          '  gl_Position.y = dot(modelviewproj[1], hpos);',
          '  gl_Position.z = dot(modelviewproj[2], hpos);',
          '  gl_Position.w = dot(modelviewproj[3], hpos);',
          '}'
        ]
      },

      fragment_shader: {
        fprecision: 'mediump',

        text: [
          'void main() {',
          '  gl_FragColor = vec4(1, 0.5, 0.5, 1);',
          '}'
        ]
      }
    };

    var error_material = {
      name : ERROR_MAT_NAME,
      type : ERROR_MAT_NAME,
      params : {},
      textures : {}
    };

    function createMaterialTable(gl, texture_table) {
      var material_table = {};

      var material_type_dictionary = {};
      var material_dictionary = {};

      material_table.createMaterialType = function(data) {
        var material_type = {};
        var material_program = gl.loadProgram(data.vertex_shader,
                                              data.fragment_shader);
        if (!material_program) {
          console.log('Failed to load program for material type: ' + name);
          return;
        }

        material_type.bind = function(material_data, textures) {
          material_program.bind();

          if (material_data.alphaBlend) {
            gl.enable(gl.BLEND);
            gl.blendEquation(gl.FUNC_ADD);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
          } else {
            gl.disable(gl.BLEND);
          }

          for (var p in material_data.params) {
            if (material_program[p]) {
              material_program[p](material_data.params[p]);
            }
          }
        };

        material_type_dictionary[data.name] = material_type;
      };

      material_table.getMaterialType = function(name) {
        var material_type = material_type_dictionary[name];
        if (!material_type) {
          console.log('Failed to find material type: ' + name);
          material_type = material_type_dictionary[ERROR_MAT_NAME];
        }
        return material_type;
      };

      material_table.createMaterial = function(data) {
        // this will create an empty material if there isn't already one
        var material = material_table.getMaterial(data.name);

        var material_type = material_table.getMaterialType(data.type);
        var textures = {};

        for (var tex in data.textures) {
          textures[tex] = texture_table.getTexture(data.textures[tex]);
        }

        material.bind = function() {
          material_type.bind(data, textures);
        };
      };

      material_table.getMaterial = function(name) {
        var material = material_dictionary[name];
        if (!material) {
          // create dummy material, it may be filled in later
          material = {};
          material_dictionary[name] = material;

          if (show_unloaded_materials) {
            var error_material = material_dictionary[ERROR_MAT_NAME];
            material.bind = error_material.bind;
          }
        }
        return material;
      };

      material_table.createMaterialType(error_material_type);
      material_table.createMaterial(error_material);

      return material_table;
    }

    var WebGLMaterial = {};
    WebGLMaterial.createMaterialTable = createMaterialTable;
    return WebGLMaterial;
  })();
