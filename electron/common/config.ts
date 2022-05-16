import { Config, ConfigSchema } from './types/config';
import fsSync, { promises as fs } from 'fs';
import path from 'path';
import { noop } from 'lodash';

const storeFileName = 'store.json';

export function createStore(folder: string, reset?: boolean): Config {
  const storePath = path.resolve(folder, storeFileName);

  const readStore = async () => {
    try {
      const json = JSON.parse(
        (await fs.readFile(storePath)).toString('utf-8'),
      ) as Partial<ConfigSchema>;

      return json as Partial<ConfigSchema>;
    } catch {
      return undefined;
    }
  };

  const writeStore = async (data: Partial<ConfigSchema>) => {
    try {
      return await fs.writeFile(storePath, JSON.stringify(data, null, 2));
    } catch {
      return undefined;
    }
  };

  const store: Config = {
    read: async <K extends keyof ConfigSchema>(key: K) => {
      const data = await readStore();
      return data?.[key] as ConfigSchema[K];
    },
    write: async (key, value) => {
      const exisingData = (await readStore()) ?? {};

      await writeStore({
        ...exisingData,
        [key]: value,
      });
    },
    async reset() {
      return fs.unlink(storePath);
    },
  };

  if (reset) fsSync.unlink(storePath, noop);

  return store;
}
