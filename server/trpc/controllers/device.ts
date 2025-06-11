import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import type { TNewDevice, TRawContent } from '../../db/db';
import { db } from '../../db/db';
import { devices } from '../../db/schema';
import type { Context } from '../context';

export class DeviceController {
  async create(newDevice: TNewDevice) {
    await db.insert(devices).values(newDevice);
    return '设备创建成功';
  }

  async delete(id: number) {
    await db.delete(devices).where(eq(devices.id, id));
    return '设备删除成功';
  }

  async edit(id: number, new_location: string) {
    await db.update(devices)
      .set({ location: new_location })
      .where(eq(devices.id, id));
    return '设备名修改成功';
  }

  async bindProgram(id: number, programId: number) {
    await db.update(devices)
      .set({ programId })
      .where(eq(devices.id, id));
    return '节目绑定成功';
  }

  async getInfo(id: number) {
    const device = await db.query.devices.findFirst({
      where: eq(devices.id, id),
      with: {
        program: true,
      },
    });
    if (!device)
      throw new TRPCError({ code: 'NOT_FOUND', message: '设备不存在' });
    return device;
  }

  async getList() {
    const res = await db.query.devices.findMany();
    return res;
  }

  async getContentsByDevice(id: number, ctx: Context) {
    // 在和 (TRawContent & { owner: string })[] 这个 getListByCategory() 返回的数据类型斗智斗勇的过程中我破防了
    // 于是写了一个返回值不带 owner 的 getListByCategoryTemp()，如果有同学能修这个 bug 非常感谢。

    const device = await this.getInfo(id);
    const contentList: (TRawContent)[] = [];
    device.program?.sequence.forEach(async (item) => {
      if (item.type === 'pool') {
        const contents = await ctx.contentController.getListByCategoryTemp(item.id);
        const randomKey = Math.floor(Math.random() * contents.length);
        contents.forEach((content) => {
          if (contents.indexOf(content) === randomKey)
            contentList.push(content); // push a random content into contentList
        });
      } else if (item.type === 'content') {
        const content = await ctx.contentController.getContentById(item.id);
        contentList.push(content);
      }
    });
    return contentList;
  }
}
