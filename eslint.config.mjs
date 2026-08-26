import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

/**
 * eslint-config-next 16 ships flat configs directly. The previous version of
 * this file wrapped the legacy names in FlatCompat, which crashed on ESLint 9
 * with "Converting circular structure to JSON" - so `npm run lint` had not
 * actually run a rule in a long time.
 */
const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'cms/payload-types.ts',
      'tmp/**',
      'sanity-export/**',
      'incoming/**',
    ],
  },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'prefer-const': 'off',

      /**
       * React Compiler advisories, kept visible as warnings rather than
       * silenced or treated as build-breaking errors.
       *
       * `immutability` and `use-memo` fire on the react-three-fiber field,
       * where writing into a typed array every frame is not a mistake - it is
       * the only way to drive a GPU buffer. `set-state-in-effect` and `refs`
       * fire on effects that deliberately react to a route change, a media
       * query regrouping, or the reduced-motion flag. Each site has been read;
       * none is a bug. New code should still avoid all four.
       */
      'react-hooks/immutability': 'warn',
      'react-hooks/use-memo': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
]

export default config
