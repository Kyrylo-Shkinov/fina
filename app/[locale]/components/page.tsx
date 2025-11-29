'use client';

export const dynamic = 'error';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Wallet, AlertCircle, Info, CheckCircle2, XCircle } from 'lucide-react';

export default function ComponentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Компоненти UI</h1>
          <p className="text-muted-foreground">
            Всі доступні компоненти з shadcn/ui та інших бібліотек
          </p>
          <Badge variant="secondary" className="mt-2">
            Тільки в dev режимі
          </Badge>
        </div>

        {/* Buttons Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Кнопки (Button)</h2>
          <Card>
            <CardHeader>
              <CardTitle>Варіанти кнопок</CardTitle>
              <CardDescription>Різні стилі та розміри кнопок</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-2 block">Варіанти (Variants)</Label>
                <div className="flex flex-wrap gap-3">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="mb-2 block">Розміри (Sizes)</Label>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">
                    <Wallet className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="mb-2 block">З іконками</Label>
                <div className="flex flex-wrap gap-3">
                  <Button>
                    <Wallet className="mr-2 h-4 w-4" />
                    З іконкою
                  </Button>
                  <Button variant="outline">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Успіх
                  </Button>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="mb-2 block">Disabled стани</Label>
                <div className="flex flex-wrap gap-3">
                  <Button disabled>Disabled</Button>
                  <Button variant="outline" disabled>
                    Disabled Outline
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Cards Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Картки (Card)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Проста картка</CardTitle>
                <CardDescription>Опис картки з основним контентом</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Тут може бути будь-який контент: текст, зображення, форми тощо.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Дія</Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Картка з іконкою</CardTitle>
                <CardDescription>Приклад використання з іконками</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  <span>Фінансовий планувальник</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Form Elements Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Елементи форм</h2>
          <Card>
            <CardHeader>
              <CardTitle>Input, Label, Textarea, Select</CardTitle>
              <CardDescription>Всі елементи для форм</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="example-input">Input поле</Label>
                <Input id="example-input" placeholder="Введіть текст..." />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="example-textarea">Textarea</Label>
                <Textarea
                  id="example-textarea"
                  placeholder="Введіть багаторядковий текст..."
                  rows={4}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Select (Вибір)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть опцію" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Опція 1</SelectItem>
                    <SelectItem value="option2">Опція 2</SelectItem>
                    <SelectItem value="option3">Опція 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="disabled-input">Disabled Input</Label>
                <Input id="disabled-input" disabled placeholder="Неактивне поле" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Badges Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Бейджі (Badge)</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="default" className="bg-green-500">
                  Custom Color
                </Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Alerts Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Сповіщення (Alert)</h2>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Інформація</AlertTitle>
              <AlertDescription>
                Це стандартне сповіщення з інформацією для користувача.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Помилка</AlertTitle>
              <AlertDescription>
                Це сповіщення про помилку. Використовується для критичних повідомлень.
              </AlertDescription>
            </Alert>
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Успіх</AlertTitle>
              <AlertDescription className="text-green-700">
                Операція виконана успішно!
              </AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Dialog Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Діалог (Dialog)</h2>
          <Card>
            <CardContent className="pt-6">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Відкрити діалог</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Приклад діалогу</DialogTitle>
                    <DialogDescription>
                      Це модальне вікно для важливих повідомлень або дій.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p>Тут може бути будь-який контент: форми, підтвердження, інформація тощо.</p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Скасувати
                    </Button>
                    <Button onClick={() => setDialogOpen(false)}>Підтвердити</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </section>

        {/* Separator Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Роздільник (Separator)</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p>Контент вище</p>
                <Separator className="my-4" />
                <p>Контент нижче</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p>Лівий контент</p>
                </div>
                <Separator orientation="vertical" />
                <div>
                  <p>Правий контент</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Combined Example */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Комбінований приклад</h2>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Форма з усіма елементами</CardTitle>
                  <CardDescription>Приклад використання всіх компонентів разом</CardDescription>
                </div>
                <Badge variant="secondary">Новий</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Важливо</AlertTitle>
                <AlertDescription>
                  Заповніть всі поля для продовження
                </AlertDescription>
              </Alert>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ім&apos;я</Label>
                  <Input id="name" placeholder="Введіть ім'я" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Категорія</Label>
                  <Select>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Оберіть категорію" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">Їжа</SelectItem>
                      <SelectItem value="transport">Транспорт</SelectItem>
                      <SelectItem value="entertainment">Розваги</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Опис</Label>
                <Textarea id="description" placeholder="Додайте опис..." rows={3} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Скасувати</Button>
              <Button>Зберегти</Button>
            </CardFooter>
          </Card>
        </section>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-8">
          <p>Компоненти з shadcn/ui та Radix UI</p>
          <p className="mt-2">
            Використовуються: Button, Card, Input, Label, Badge, Alert, Separator, Textarea, Select, Dialog
          </p>
        </div>
      </div>
    </div>
  );
}

