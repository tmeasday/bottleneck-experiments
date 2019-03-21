import Bottleneck, { Group } from 'bottleneck';

const commonOptions = {
  datastore: 'redis',
  clearDatastore: true,
};

const masterBottleneck = new Bottleneck({
  ...commonOptions,
  id: 'master',
  maxConcurrent: 10,
});

const accountGroup = new Group({
  ...commonOptions,
  maxConcurrent: 2,
});

const firstAccountBottleneck = accountGroup.key('12345');
firstAccountBottleneck.chain(masterBottleneck);

const secondAccountBottleneck = accountGroup.key('23456');
secondAccountBottleneck.chain(masterBottleneck);

let numberActiveFirstJobs = 0;
let numberActiveSecondJobs = 0;

for (let i = 0; i < 100; i += 1) {
  firstAccountBottleneck.schedule(async () => {
    numberActiveFirstJobs += 1;
    console.log(`Running first job, ${numberActiveFirstJobs} active`);

    await new Promise(r => setTimeout(r, 1000));

    numberActiveFirstJobs -= 1;
  });

  secondAccountBottleneck.schedule(async () => {
    numberActiveSecondJobs += 1;
    console.log(`Running second job, ${numberActiveSecondJobs} active`);

    await new Promise(r => setTimeout(r, 1000));

    numberActiveSecondJobs -= 1;
  });
}

secondAccountBottleneck.updateSettings({
  maxConcurrent: 10,
});
