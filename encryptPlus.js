(function(Scratch) {
  'use strict';

  class HashExtension {
    getInfo() {
      return {
        id: 'encryptPlus',
        name: 'encrypt+',
        blocks: [
          {
            opcode: 'hash',
            blockType: Scratch.BlockType.REPORTER,
            text: '[TEXT]を[ALGORITHM]でハッシュ化',
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello, world!'
              },
              ALGORITHM: {
                type: Scratch.ArgumentType.STRING,
                menu: 'algorithms',
                defaultValue: 'SHA-256'
              }
            }
          }
        ],
        menus: {
          algorithms: {
            acceptReporters: true,
            items: ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']
          }
        }
      };
    }

    async hash({ TEXT, ALGORITHM }) {
      const encoder = new TextEncoder();
      const data = encoder.encode(TEXT);
      let hashBuffer;
      hashBuffer = await crypto.subtle.digest(ALGORITHM, data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    }
  }

  Scratch.extensions.register(new HashExtension());
})(Scratch);
