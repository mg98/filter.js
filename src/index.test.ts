import { matchCondition } from './index';

describe('match condition', () => {
  const data = {
    name: 'Jeremy',
    age: 18,
    hobbies: ['Swimming', 'Diving', 'Making music'],
    address: {
      city: 'Brooklyn',
      zipCode: '99',
    },
    'Favorite Book': 'Pain and Punishment',
  };

  it('various test cases', () => {
    expect(matchCondition(data, "name != 'Jeremy'")).toBeFalsy();
    expect(matchCondition(data, "`Favorite Book` = 'Pain and Punishment' and age >= 18")).toBeTruthy();
    expect(matchCondition(data, "age > 20 and address.city = 'Brooklyn' or `address.zipCode` = 99")).toBeTruthy();
    expect(
      matchCondition(
        data,
        "(age = 17 or age < 19) and ((hobbies.1 = 'Diving' and `name` not in ('Jeffrey', 'Jimmy')))",
      ),
    ).toBeTruthy();
    expect(matchCondition(data, 'hobbies > 2')).toBeTruthy();
    expect(matchCondition(data, 'hobbies < 3')).toBeFalsy();
  });
});
