import Bree from 'bree'

export const initBreeInstance = () => {
    const bree = new Bree({
        // logger: false,
        jobs: [
            {
                name: 'updateRequestsHistory',
                timeout: 0,
                interval: '1h'
            }
        ]
    });

    (async () => {
        await bree.start();
    })();
}