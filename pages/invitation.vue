<template>
  <Title>邀请码管理</Title>
  <div>
    <Card>
      <CardHeader class="flex flex-row gap-2">
        <div class="mr-auto">
          <CardTitle class="text-2xl font-bold">
            邀请码管理
          </CardTitle>
        </div>
        <div class="flex ml-auto gap-4">
          <Select v-model="filter">
            <SelectTrigger class="w-[200px]">
              <SelectValue placeholder="按类别筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">
                  全部
                </SelectItem>
                <SelectItem value="used">
                  已使用
                </SelectItem>
                <SelectItem value="spare">
                  未使用
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Dialog>
            <DialogTrigger as-child>
              <Button variant="default" class="ml-auto">
                批量生成
              </Button>
            </DialogTrigger>
            <DialogContent class="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>批量生成邀请码</DialogTitle>
              </DialogHeader>
              <div class="grid gap-4 py-4">
                <div class="grid grid-cols-4 items-center gap-4">
                  <Label class="text-right">
                    邀请码数量
                  </Label>
                  <Input v-model="number" class="col-span-3" />
                </div>
              </div>
              <DialogClose>
                <Button v-if="!isPending" type="submit" @click="handleGenerate()">
                  确认生成
                </Button>
                <Button v-if="isPending" type="submit" disabled>
                  <Loader2 v-if="isPending" class="w-4 h-4 mr-2 animate-spin" />
                  请稍候……
                </Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                id
              </TableHead>
              <TableHead>
                邀请码
              </TableHead>
              <TableHead>
                状态
                <!-- badge列 -->
              </TableHead>
              <TableHead>
                创建日期
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="invitation in fetchList" :key="invitation.id" class="text-left">
              <TableCell class="text-gray-500">
                {{ invitation.id }}
              </TableCell>
              <TableCell>
                {{ invitation.code }}
                <CopyLink :text="invitation.code" />
              </TableCell>
              <TableCell>
                <Badge :variant="invitation.state ? 'c_created' : 'c_approved'">
                  <!-- 此处没有专门的variant于是暂时选了颜色合适的 -->
                  {{ invitation.state ? '已使用' : '未使用' }}
                </Badge>
              </TableCell>
              <TableCell class="text-gray-500">
                {{ invitation.createdAt.toLocaleDateString() }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { ref } from 'vue';
import { CopyLink } from '~/components/ui/CopyLink';

const { $api } = useNuxtApp();
const number = ref<number>(0);
const filter = ref('all');

const queryClient = useQueryClient();
onMounted(() => {
  if (useUserStore().role === 'club') {
    useRouter().push('/'); // 跳转到首页
  }
});

interface Invitation { id: number; code: string; state: boolean; createdAt: Date }
// 定义获取邀请码的返回类型

async function generateCodes(count: number) {
  return await $api.invitationCode.generateBatchCode.query({ batch: count });
}
// 邀请码生成

const { data: alllist, suspense: allSuspense } = useQuery({
  queryKey: ['invitation', 'all'],
  queryFn: () => $api.invitationCode.listAll.query() as Promise<Invitation[]>,
});
await allSuspense();
// 获取全部邀请码列表

const { data: usedlist, suspense: usedSuspense } = useQuery({
  queryKey: ['invitation', 'used'],
  queryFn: () => $api.invitationCode.listUsed.query() as Promise<Invitation[]>,
});
await usedSuspense();
// 获取已使用的邀请码列表

const { data: sparelist, suspense: spareSuspense } = useQuery({
  queryKey: ['invitation', 'spare'],
  queryFn: () => $api.invitationCode.listSpare.query() as Promise<Invitation[]>,
});
await spareSuspense();
// 获取未使用的邀请码列表

const { mutate: addMutation, isPending } = useMutation({
  mutationFn: $api.invitationCode.addCodeBatch.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['invitation', 'all'] });
    queryClient.invalidateQueries({ queryKey: ['invitation', 'used'] });
    queryClient.invalidateQueries({ queryKey: ['invitation', 'spare'] });
    toast.success('邀请码已生成');
  },
  onError: err => useErrorHandler(err),
});
// 邀请码添加

async function handleGenerate() {
  try {
    const generatedCodes = await generateCodes(Number(number.value));
    // 储存生成的邀请码
    addMutation({ batch: generatedCodes });
  } catch (err) {
    useErrorHandler(err);
  }
}
// handleGenerate方法集成了后端的生成邀请码和添加邀请码操作

const fetchList = computed(() => {
  return {
    all: alllist.value || [],
    used: usedlist.value || [],
    spare: sparelist.value || [],
  }[filter.value];
});
// 返回响应式数据
</script>
