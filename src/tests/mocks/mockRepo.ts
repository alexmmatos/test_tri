export function createMockRepo() {
    let data: any[] = [];
  
    function matchWhere(item: any, where: any) {
      return Object.keys(where).every(key => {
        const value = where[key];
        if (value && typeof value === 'object') {
          // Suporte ao Between do TypeORM
          if ((value._type === 'between' || value.type === 'between') && (value._value || value.value)) {
            const [start, end] = value._value || value.value;
            return item[key] >= start && item[key] <= end;
          }
          // Suporte ao In do TypeORM
          if ((value._type === 'in' || value.type === 'in') && (value._value || value.value)) {
            const arr = value._value || value.value;
            return arr.includes(item[key]);
          }
        }
        // Array como In
        if (Array.isArray(value)) {
          return value.includes(item[key]);
        }
        return item[key] === value;
      });
    }
  
    return {
      findOneBy: jest.fn(async (query) => data.find(item => matchWhere(item, query))),
      findOne: jest.fn(async ({ where }) => data.find(item => matchWhere(item, where))),
      create: jest.fn((obj) => obj),
      save: jest.fn(async (obj) => {
        data.push(obj);
        return obj;
      }),
      find: jest.fn(async ({ where } = {}) => {
        if (!where) return data;
        return data.filter(item => matchWhere(item, where));
      }),
      remove: jest.fn(async (items) => {
        data = data.filter(item => !items.includes(item));
        return items;
      }),
      _reset: () => { data = []; }
    };
  }