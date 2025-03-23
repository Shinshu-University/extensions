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
          },
          {
            opcode: 'encrypt',
            blockType: Scratch.BlockType.REPORTER,
            text: '[TEXT]を[KEY]でAES-128暗号化',
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello, world!'
              },
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '1234567890123456'
              }
            }
          },
          {
            opcode: 'decrypt',
            blockType: Scratch.BlockType.REPORTER,
            text: '[CIPHERTEXT]を[KEY]でAES-128復号化',
            arguments: {
              CIPHERTEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: ''
              },
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '1234567890123456'
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

    async encrypt({ TEXT, KEY }) {
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(KEY),
        { name: 'AES-CBC' },
        false,
        ['encrypt']
      );
      const iv = crypto.getRandomValues(new Uint8Array(16));
      const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-CBC', iv: iv },
        key,
        new TextEncoder().encode(TEXT)
      );
      const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
      const ciphertextHex = Array.from(new Uint8Array(ciphertext)).map(b => b.toString(16).padStart(2, '0')).join('');
      return ivHex + ciphertextHex;
    }

    async decrypt({ CIPHERTEXT, KEY }) {
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(KEY),
        { name: 'AES-CBC' },
        false,
        ['decrypt']
      );
      const iv = new Uint8Array(CIPHERTEXT.substring(0, 32).match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      const ciphertext = new Uint8Array(CIPHERTEXT.substring(32).match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      const plaintext = await crypto.subtle.decrypt(
        { name: 'AES-CBC', iv: iv },
        key,
        ciphertext
      );
      return new TextDecoder().decode(plaintext);
    }
  }

  Scratch.extensions.register(new HashExtension());
})(Scratch);
