import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { ShaderBackground } from '@/components/ShaderBackground'

export function CreateMarket() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Other')
  const [resolveDate, setResolveDate] = useState('')
  const [options, setOptions] = useState<string[]>(['', ''])
  const [initialLiquidity, setInitialLiquidity] = useState('1000')

  const createMarketMutation = useMutation({
    mutationFn: apiClient.createMarket,
    onSuccess: (data) => {
      toast.success('Market created successfully!')
      navigate(`/markets/${data.id}`)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create market')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validOptions = options.filter((opt) => opt.trim() !== '')

    if (validOptions.length < 2) {
      toast.error('Please provide at least 2 options')
      return
    }

    createMarketMutation.mutate({
      title,
      description,
      category,
      resolveDate,
      options: validOptions,
      initialLiquidity: parseFloat(initialLiquidity),
    })
  }

  const addOption = () => {
    setOptions([...options, ''])
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const categories = ['Sports', 'Politics', 'Crypto', 'Technology', 'Entertainment', 'Other']

  return (
    <div className="relative min-h-screen">
      {/* Shader Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <ShaderBackground className="fixed" />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
      </div>

      <div className="max-w-3xl mx-auto relative">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create Prediction Market</CardTitle>
          <CardDescription>
            Set up a new market for others to trade on real-world outcomes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Market Title *</Label>
              <Input
                id="title"
                placeholder="Will Bitcoin reach $100k by end of 2024?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Provide detailed resolution criteria and context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolveDate">Resolution Date *</Label>
                <Input
                  id="resolveDate"
                  type="datetime-local"
                  value={resolveDate}
                  onChange={(e) => setResolveDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="liquidity">Initial Liquidity ($)</Label>
              <Input
                id="liquidity"
                type="number"
                min="100"
                step="100"
                value={initialLiquidity}
                onChange={(e) => setInitialLiquidity(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Liquidity enables smooth trading. Minimum $100 recommended.
              </p>
            </div>

            <div className="space-y-3">
              <Label>Market Options *</Label>
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    required
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addOption} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Option
              </Button>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/markets')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createMarketMutation.isPending}
              >
                {createMarketMutation.isPending ? 'Creating...' : 'Create Market'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
