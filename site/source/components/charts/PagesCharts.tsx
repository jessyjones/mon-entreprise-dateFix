import { Strong } from '@/design-system/typography'
import { Li, Ul } from '@/design-system/typography/list'
import { Body } from '@/design-system/typography/paragraphs'
import { RealResponsiveContainer } from '@/pages/Stats/Chart'
import { formatValue } from 'publicodes'
import {
	Bar,
	ComposedChart,
	Legend,
	Tooltip,
	TooltipProps,
	XAxis,
	YAxis,
} from 'recharts'
import styled, { css } from 'styled-components'
import { useDarkMode } from '@/hooks/useDarkMode'

type Data =
	| Array<{ date: string; nombre: number }>
	| Array<{ date: string; nombre: Record<string, number> }>

type PagesChartProps = {
	sync?: boolean
	data: Data
}
const Palette = [
	'#1ea0f5',
	'#697ad5',
	'#b453b6',
	'#ff2d96',
	'#fd667f',
	'#fc9e67',
	'#fad750',
	'#bed976',
	'#82da9d',
	'#46dcc3',
]

function getColor(i: number): string {
	return Palette[i % Palette.length]
}

export default function PagesChart({ data, sync = true }: PagesChartProps) {
	const [darkMode] = useDarkMode()

	if (!data.length) {
		return null
	}

	const dataKeys = Object.keys(data[0].nombre)
	const flattenedData = (data as any).map((d: any) => ({ ...d, ...d.nombre }))

	return (
		<Body as="div">
			<RealResponsiveContainer
				width="100%"
				height={500}
				css={`
					svg {
						overflow: visible;
					}
				`}
			>
				<ComposedChart
					layout="horizontal"
					data={flattenedData}
					syncId={sync ? '1' : undefined}
				>
					<Legend />
					<XAxis
						dataKey="date"
						type="category"
						tickFormatter={formatMonth}
						angle={-45}
						textAnchor="end"
						height={60}
						minTickGap={-8}
						stroke={darkMode ? 'lightGrey' : 'darkGray'}
					/>

					<YAxis
						tickFormatter={(x) => formatValue(x)}
						domain={['0', 'auto']}
						type="number"
						stroke={darkMode ? 'lightGrey' : 'darkGray'}
					/>

					<Tooltip content={<CustomTooltip />} />

					{dataKeys.map((k, i) => (
						<Bar
							key={k}
							dataKey={k}
							name={formatLegend(k)}
							fill={getColor(i)}
							stackId={1}
						/>
					))}
				</ComposedChart>
			</RealResponsiveContainer>
		</Body>
	)
}

function formatMonth(date: string | Date) {
	return new Date(date).toLocaleString('default', {
		month: 'short',
		year: '2-digit',
	})
}

const CustomTooltip = ({
	active,
	payload,
}: TooltipProps<string | number, string>) => {
	if (!active || !payload) {
		return null
	}

	const data = payload[0].payload

	return (
		<StyledLegend>
			<Body>{formatMonth(data.date)}</Body>
			<Ul>
				{payload
					.map(({ color, value, name }) => (
						<ColoredLi key={name} color={color}>
							<Strong>
								{typeof value === 'number' ? formatValue(value) : value}
							</Strong>{' '}
							{name && formatLegend(name)}
						</ColoredLi>
					))
					.reverse()}
			</Ul>
		</StyledLegend>
	)
}

const formatLegend = (key: string) =>
	key.replace('simulateurs / ', '').replace(/_/g, ' ')

const ColoredLi = styled(Li)<{ color?: string }>`
	::before {
		${({ color }) =>
			color &&
			css`
				color: ${color} !important;
			`};
	}
`

export const StyledLegend = styled.div`
	background-color: ${({ theme }) =>
		theme.darkMode
			? theme.colors.extended.dark[600]
			: theme.colors.extended.grey[100]};
	padding: 0.125rem 1rem;
	box-shadow: ${({ theme }) =>
		theme.darkMode ? theme.elevationsDarkMode[3] : theme.elevations[3]};
	border-radius: ${({ theme }) => theme.box.borderRadius};
`
