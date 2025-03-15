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
            items: ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512', 'MD5']
          }
        }
      };
    }

    async hash({ TEXT, ALGORITHM }) {
      const encoder = new TextEncoder();
      const data = encoder.encode(TEXT);
      let hashBuffer;
      if (ALGORITHM === 'MD5') {
        hashBuffer = await crypto.subtle.digest({ name: 'MD5' }, data); // MD5の場合
      } else {
        hashBuffer = await crypto.subtle.digest(ALGORITHM, data); // 他のアルゴリズムの場合
      }
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    }
  }

  Scratch.extensions.register(new HashExtension());
})(Scratch);
