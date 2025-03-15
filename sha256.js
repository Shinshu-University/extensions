(function(Scratch) {
  'use strict';

  class Sha256Extension {
    getInfo() {
      return {
        id: 'sha256',
        name: 'SHA256ハッシュ',
        blocks: [
          {
            opcode: 'sha256Hash',
            blockType: Scratch.BlockType.REPORTER,
            text: '[TEXT]のSHA256ハッシュ',
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello, world!'
              }
            }
          }
        ]
      };
    }

    async sha256Hash({ TEXT }) {
      const encoder = new TextEncoder();
      const data = encoder.encode(TEXT);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    }
  }

  Scratch.extensions.register(new Sha256Extension());
})(Scratch);
