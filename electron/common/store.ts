import { RsgoBatchStats, RsgoBatchStore, MainStore } from './types/store';
import fsSync, { promises as fs } from 'fs';
import path from 'path';
import { noop } from 'lodash';
import { safeStorage } from 'electron';

const storeFileName = 'store.json';

type CombinedStore = RsgoBatchStore & RsgoBatchStats;

export function createStore(folder: string, reset?: boolean): MainStore {
  const storePath = path.resolve(folder, storeFileName);

  const readStore = async () => {
    try {
      const json = JSON.parse(
        (await fs.readFile(storePath)).toString('utf-8'),
      ) as Partial<CombinedStore>;

      if (json.emailConfig && (typeof json.emailConfig as any) === 'string') {
        try {
          json.emailConfig = JSON.parse(
            safeStorage.decryptString(
              Buffer.from(json.emailConfig as any, 'base64'),
            ),
          );
        } catch (e) {
          if (e instanceof SyntaxError) {
            json.emailConfig = undefined;
          }
        }
      }

      return json as Partial<CombinedStore>;
    } catch {
      return undefined;
    }
  };

  const writeStore = async (data: Partial<CombinedStore>) => {
    if (data.emailConfig) {
      data.emailConfig = safeStorage
        .encryptString(JSON.stringify(data.emailConfig))
        .toString('base64') as any;
    }

    try {
      return await fs.writeFile(storePath, JSON.stringify(data, null, 2));
    } catch {
      return undefined;
    }
  };

  const store: MainStore = {
    read: async key => {
      const data = await readStore();
      return data?.[key];
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
    stats: {
      async stabilizationHistory() {
        const data = await readStore();
        return data?.stabilizationHistory ?? [];
      },
      async addStab(data) {
        const exisingData = (await readStore()) ?? {};

        return writeStore({
          ...exisingData,
          stabilizationHistory: [
            ...(exisingData.stabilizationHistory ?? []),
            data,
          ],
        });
      },
    },
  };

  if (reset) fsSync.unlink(storePath, noop);

  return store;
}
