module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: [
        '**/*.(t|j)s',
    ],
    coverageDirectory: '../coverage',
    moduleFileExtensions: ['js', 'json', 'ts'],
    globals: {
        'ts-jest': {
            tsconfig: {
                target: 'ES2020',
                experimentalDecorators: true,
                emitDecoratorMetadata: true,
                strict: false,
                skipLibCheck: true,
                useDefineForClassFields: false,
            },
        },
    },
};