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

var TrenchPlayer = (function() {

    var player_matrix;
    var player_pos = [0,0,0];
    var player_velocity = [0,0,0];

    var player_forward_speed = 1;

    var thrust_drag = 0.95;
    var thrust_accel = 1;
    var thrust_max_speed = 15;

    function init(model) {
      player_matrix = Math3D.mat4x4();
      player_pos = [0,0,0];
      player_velocity = [0,0,0];
      World3D.add('player', model, player_matrix);
    }

    function tick(dt) {
      // constantly move forward
      player_pos[1] += player_forward_speed * dt;

      var player_thrust = [0,0,0];
      if (JSGlobal.key_state[Key.UP]) {
        player_thrust[2] += 1;
      }
      if (JSGlobal.key_state[Key.DOWN]) {
        player_thrust[2] -= 1;
      }
      if (JSGlobal.key_state[Key.RIGHT]) {
        player_thrust[0] += 1;
      }
      if (JSGlobal.key_state[Key.LEFT]) {
        player_thrust[0] -= 1;
      }

      // update thrust and apply
      Math3D.scaleVec3Self(player_velocity, thrust_drag);
      Math3D.normalizeVec3(player_thrust);
      Math3D.scaleVec3Self(player_thrust, dt * thrust_accel);
      Math3D.addVec3Self(player_velocity, player_thrust);

      var speed = Math3D.lengthVec3(player_velocity);
      if (speed > thrust_max_speed) {
        Math3D.scaleVec3Self(player_velocity, thrust_max_speed / speed);
      }
      Math3D.addVec3Self(player_pos, Math3D.scaleVec3(player_velocity, dt));

      player_matrix[12] = player_pos[0];
      player_matrix[13] = player_pos[1];
      player_matrix[14] = player_pos[2];
      World3D.move('player', player_matrix);
    }

    var TrenchPlayer = {};
    TrenchPlayer.tick = tick;
    TrenchPlayer.init = init;
    TrenchPlayer.getPosition = function () { return player_pos; };
    return TrenchPlayer;
  })();
