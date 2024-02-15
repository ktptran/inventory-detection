import { put } from 'aws-amplify/api';
import { v4 as uuidv4 } from 'uuid';

async function putImage(image) {
  try {
    const restOperation = put({
      apiName: 'HttpApi',
      path: '/image',
      options: {
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS,PUT',
          'Content-Type': 'application/json',
        },
        body: {
          image,
          uuid: uuidv4(),
        },
      },
    });
    const response = await restOperation.response;
    console.log('PUT call succeeded: ', response);
  } catch (err) {
    console.error('PUT call failed: ', err);
  }
}

export { putImage };
