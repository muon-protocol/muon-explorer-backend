import Bree from 'bree'

export const initBreeInstance = () => {
    const bree = new Bree({
        jobs: [
            {
                name: 'requestsHistory.job',
                timeout: 0,
                interval: '1h'
            },
            {
                name: 'requestsHistory2.job',
                timeout: 0,
                interval: '5m'
            },
            {
                name: 'applications.job',
                timeout: 0,
                interval: '1h'
            }
        ]
    });

    (async () => {
        await bree.start();
    })();
}