module.exports = {
    reactStrictMode: true,
    async redirects() {
        return [
            {
                source: '/auth',
                destination: '/auth',
                permanent: true,
            },
        ];
    },
};
