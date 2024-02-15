import { post, get } from 'aws-amplify/api';
import { v4 as uuidv4 } from 'uuid';

async function postImage(image) {
  try {
    const restOperation = post({
      apiName: 'HttpApi',
      path: '/image',
      options: {
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

async function getImage(key_name) {
  try {
    const restOperation = get({
      apiname: 'HttpApi',
      path: `/image/${key_name}`,
    });
    const response = await restOperation.response;
    console.log('GET call succeeded: ', response);
  } catch (err) {
    console.error('GET call failed: ', err);
  }
}

export { postImage };
