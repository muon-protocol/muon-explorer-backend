import Bree from 'bree'

export const initBreeInstance = () => {
    const bree = new Bree({
        jobs: [
            {
                name: 'updateRequestsHistory',
                timeout: 0,
                interval: '1h'
            },
            {
                name: 'updateApplications',
                timeout: 0,
                interval: '1h'
            }
        ]
    });

    (async () => {
        await bree.start();
    })();
}